# Upload-ChaletPhotosToCloudinary.ps1
# Works on Windows PowerShell 5.1+ and PowerShell 7+
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

try {
  Add-Type -AssemblyName System.Net.Http -ErrorAction Stop
} catch {
  throw "Failed to load System.Net.Http. Make sure you are running PowerShell 5.1+."
}

#region ===== Cloudinary CONFIG =====
$CloudName    = "dancebjgn"

# Recommended: set these in Environment Variables instead of hardcoding:
# $env:CLOUDINARY_API_KEY
# $env:CLOUDINARY_API_SECRET
$ApiKey    =  "453152336852852" 
$ApiSecret = "xEZgc-Sdc2irsZlgA0AuCmETuTo"

# FAST FIX: Signed upload (bypasses unsigned preset whitelist issues)
$UploadPreset = ""   # keep empty => SIGNED upload
#endregion

#region ===== Local Paths CONFIG =====
$ResortsTsPath = "C:\Users\code4\Desktop\SARA\Amwaj-resorts-app\src\assets\resorts.ts"
$AssetsRoot    = "C:\Users\code4\Desktop\SARA\Amwaj-resorts-app\public\assets"
$OutputRoot    = "C:\Users\code4\Desktop\SARA"
#endregion

#region ===== Upload Behavior CONFIG =====
$CloudFolderRoot = "amwaj"
$Overwrite       = $true
$InvalidateCDN   = $false
$SleepMs         = 150
$MaxRetries      = 3
#endregion

function Assert-Config {
  if ([string]::IsNullOrWhiteSpace($CloudName)) { throw "CloudName is required." }
  if ([string]::IsNullOrWhiteSpace($AssetsRoot)) { throw "AssetsRoot is required." }
  if ([string]::IsNullOrWhiteSpace($OutputRoot)) { throw "OutputRoot is required." }

  if ([string]::IsNullOrWhiteSpace($UploadPreset)) {
    if ([string]::IsNullOrWhiteSpace($ApiKey)) { throw "ApiKey is required for signed upload. Set env:CLOUDINARY_API_KEY." }
    if ([string]::IsNullOrWhiteSpace($ApiSecret)) { throw "ApiSecret is required for signed upload. Set env:CLOUDINARY_API_SECRET." }
  } else {
    $script:UploadPresetTrimmed = $UploadPreset.Trim()
    if ([string]::IsNullOrWhiteSpace($script:UploadPresetTrimmed)) {
      throw "UploadPreset is whitespace only."
    }
  }
}

function New-DirectoryIfMissing([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-Sha1Hex([string]$InputText) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputText)
  $sha1  = [System.Security.Cryptography.SHA1]::Create()
  try {
    $hash = $sha1.ComputeHash($bytes)
    return -join ($hash | ForEach-Object { $_.ToString("x2") })
  } finally {
    $sha1.Dispose()
  }
}

function New-CloudinarySignature([hashtable]$ParamsToSign, [string]$Secret) {
  $keys = $ParamsToSign.Keys | Sort-Object
  $pairs = foreach ($k in $keys) { "$k=$($ParamsToSign[$k])" }
  $stringToSign = ($pairs -join "&")
  return (Get-Sha1Hex ($stringToSign + $Secret))
}

function ConvertTo-SafeName([string]$Text) {
  if ([string]::IsNullOrWhiteSpace($Text)) { return "item" }
  $t = $Text.Trim()
  $t = ($t -replace "[^\p{L}\p{Nd}_-]+", "_")
  $t = ($t -replace "_{2,}", "_")
  $t = $t.Trim("_")
  if ($t.Length -eq 0) { return "item" }
  return $t
}

function Resolve-LocalImagePath([string]$AssetsRootPath, [string]$ImagePathFromTs) {
  $rel = $ImagePathFromTs.Trim()
  $rel = $rel.TrimStart("/")
  if ($rel.StartsWith("assets/")) { $rel = $rel.Substring(7) }
  $rel = $rel.Replace("/", "\")
  return (Join-Path $AssetsRootPath $rel)
}

function Get-ResortsFromTs([string]$Path) {
  $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $pattern = '\{\s*id:\s*"(?<id>[^"]+)"[\s\S]*?name:\s*"(?<name>[^"]+)"[\s\S]*?images:\s*\[(?<images>[\s\S]*?)\]\s*,'
  $resortMatches = [regex]::Matches($content, $pattern)

  $items = @()
  foreach ($m in $resortMatches) {
    $id   = $m.Groups["id"].Value
    $name = $m.Groups["name"].Value
    $imgBlock = $m.Groups["images"].Value

    $imgMatches = [regex]::Matches($imgBlock, '"(?<p>[^"]+)"')
    $imgs = @()
    foreach ($im in $imgMatches) { $imgs += $im.Groups["p"].Value }

    if ($imgs.Count -gt 0) {
      $items += [pscustomobject]@{ Id=$id; Name=$name; Images=$imgs }
    }
  }
  return $items
}

# Reusable HttpClient
$script:HttpClient = $null
function Get-HttpClient {
  if ($null -eq $script:HttpClient) {
    $handler = New-Object System.Net.Http.HttpClientHandler
    $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [TimeSpan]::FromMinutes(10)
    $script:HttpClient = $client
  }
  return $script:HttpClient
}

function Invoke-CloudinaryUpload {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath,
    [Parameter(Mandatory=$true)][hashtable]$ExtraParams
  )

  $uri = "https://api.cloudinary.com/v1_1/$CloudName/image/upload"
  $timestamp = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

  $form = New-Object System.Net.Http.MultipartFormDataContent
  $fileStream = $null
  try {
    $fileStream = [System.IO.File]::OpenRead($FilePath)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/octet-stream")
    $form.Add($fileContent, "file", [System.IO.Path]::GetFileName($FilePath))

    foreach ($k in $ExtraParams.Keys) {
      $form.Add((New-Object System.Net.Http.StringContent([string]$ExtraParams[$k])), $k)
    }

    if ([string]::IsNullOrWhiteSpace($UploadPreset)) {
      # Signed upload
      $toSign = @{}
      foreach ($k in $ExtraParams.Keys) { $toSign[$k] = [string]$ExtraParams[$k] }
      $toSign["timestamp"] = [string]$timestamp

      $signature = New-CloudinarySignature -ParamsToSign $toSign -Secret $ApiSecret

      $form.Add((New-Object System.Net.Http.StringContent($ApiKey)), "api_key")
      $form.Add((New-Object System.Net.Http.StringContent([string]$timestamp)), "timestamp")
      $form.Add((New-Object System.Net.Http.StringContent($signature)), "signature")
    } else {
      # Unsigned upload (not used in this fast-fix mode)
      $form.Add((New-Object System.Net.Http.StringContent($script:UploadPresetTrimmed)), "upload_preset")
    }

    $client = Get-HttpClient
    $resp = $client.PostAsync($uri, $form).Result
    $body = $resp.Content.ReadAsStringAsync().Result

    if (-not $resp.IsSuccessStatusCode) {
      throw "Cloudinary upload failed. HTTP $([int]$resp.StatusCode). Body: $body"
    }

    return ($body | ConvertFrom-Json)
  }
  finally {
    if ($fileStream) { $fileStream.Dispose() }
    $form.Dispose()
  }
}

function Invoke-UploadWithRetry {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath,
    [Parameter(Mandatory=$true)][hashtable]$ExtraParams
  )

  $attempt = 0
  while ($true) {
    $attempt++
    try {
      return (Invoke-CloudinaryUpload -FilePath $FilePath -ExtraParams $ExtraParams)
    } catch {
      if ($attempt -ge $MaxRetries) { throw }
      Start-Sleep -Milliseconds (400 * $attempt)
    }
  }
}

function Export-JsonUtf8([object]$Obj, [string]$Path) {
  $payload = $Obj
  if ($null -eq $Obj) { $payload = @() }
  elseif ($Obj -is [System.Collections.IEnumerable] -and -not ($Obj -is [string]) -and -not ($Obj -is [hashtable])) {
    $payload = @($Obj | ForEach-Object { $_ })
  }
  $json = $payload | ConvertTo-Json -Depth 10
  Set-Content -LiteralPath $Path -Value $json -Encoding UTF8
}

# ===================== MAIN =====================
Assert-Config
New-DirectoryIfMissing $OutputRoot

$timestampTag = (Get-Date -Format "yyyyMMdd_HHmmss")
$masterOutDir = Join-Path $OutputRoot ("master_" + $timestampTag)
New-DirectoryIfMissing $masterOutDir

$logPath = Join-Path $masterOutDir "run.log"
$failedCsvPath = Join-Path $masterOutDir "failed_uploads.csv"

$allRecords = New-Object System.Collections.Generic.List[object]
$failedRecords = New-Object System.Collections.Generic.List[object]

$resorts = @()
if (-not [string]::IsNullOrWhiteSpace($ResortsTsPath) -and (Test-Path -LiteralPath $ResortsTsPath)) {
  $resorts = Get-ResortsFromTs -Path $ResortsTsPath
}

if ($resorts.Count -eq 0) {
  $dirs = Get-ChildItem -LiteralPath $AssetsRoot -Directory
  foreach ($d in $dirs) {
    $imgs = Get-ChildItem -LiteralPath $d.FullName -File -Recurse |
      Where-Object { $_.Extension -match "^\.(jpg|jpeg|png|webp)$" } |
      Sort-Object FullName |
      ForEach-Object { $_.FullName }

    if ($imgs.Count -gt 0) {
      $resorts += [pscustomobject]@{ Id=$d.Name; Name=$d.Name; Images=$imgs }
    }
  }
}

if ($resorts.Count -eq 0) { throw "No resorts found. Check ResortsTsPath or AssetsRoot." }

"Found resorts: $($resorts.Count)" | Tee-Object -FilePath $logPath -Append | Out-Null

foreach ($r in $resorts) {
  $resortId = [string]$r.Id
  $resortName = [string]$r.Name

  $resortOutDir = Join-Path $masterOutDir $resortId
  New-DirectoryIfMissing $resortOutDir

  $records = New-Object System.Collections.Generic.List[object]

  $imageList = @()
  if ($r.Images.Count -gt 0) {
    if ($r.Images[0] -is [string] -and ($r.Images[0].StartsWith("/") -or $r.Images[0].StartsWith("assets/"))) {
      foreach ($p in $r.Images) { $imageList += (Resolve-LocalImagePath -AssetsRootPath $AssetsRoot -ImagePathFromTs $p) }
    } else {
      $imageList = $r.Images
    }
  }

  $seen = @{}
  $ordered = @()
  foreach ($p in $imageList) {
    $key = $p.ToLowerInvariant()
    if (-not $seen.ContainsKey($key)) { $seen[$key] = $true; $ordered += $p }
  }

  if ($ordered.Count -eq 0) { "Skip ${resortId}: no images." | Tee-Object -FilePath $logPath -Append | Out-Null; continue }

  "Uploading $resortId ($($ordered.Count) images)..." | Tee-Object -FilePath $logPath -Append | Out-Null

  for ($i = 0; $i -lt $ordered.Count; $i++) {
    $localPath = $ordered[$i]
    if (-not (Test-Path -LiteralPath $localPath)) {
      $failedRecords.Add([pscustomobject]@{ resort_id=$resortId; resort_name=$resortName; position=($i+1); local_file=$localPath; error="File not found" }) | Out-Null
      continue
    }

    $base = [System.IO.Path]::GetFileNameWithoutExtension($localPath)
    $safeBase = ConvertTo-SafeName $base
    $pos = "{0:D3}" -f ($i + 1)

    $folder = "$CloudFolderRoot/$resortId"
    $publicId = "${pos}_${safeBase}"

    $extra = @{
      folder     = $folder
      public_id  = $publicId
      overwrite  = ($Overwrite.ToString().ToLowerInvariant())
      invalidate = ($InvalidateCDN.ToString().ToLowerInvariant())
    }

    try {
      $resp = Invoke-UploadWithRetry -FilePath $localPath -ExtraParams $extra

      $rec = [pscustomobject]@{
        resort_id=$resortId; resort_name=$resortName; position=($i+1); local_file=$localPath
        cloudinary_folder=$folder; public_id=$resp.public_id; asset_id=$resp.asset_id; url=$resp.secure_url
        format=$resp.format; width=$resp.width; height=$resp.height; bytes=$resp.bytes; created_at=$resp.created_at
        original_filename=$resp.original_filename
      }

      $records.Add($rec) | Out-Null
      $allRecords.Add($rec) | Out-Null
      Start-Sleep -Milliseconds $SleepMs
    }
    catch {
      $failedRecords.Add([pscustomobject]@{ resort_id=$resortId; resort_name=$resortName; position=($i+1); local_file=$localPath; error=$_.Exception.Message }) | Out-Null
      "FAILED $resortId image $($i+1): $($_.Exception.Message)" | Tee-Object -FilePath $logPath -Append | Out-Null
    }
  }

  $csvPath  = Join-Path $resortOutDir "${resortId}_images.csv"
  $jsonPath = Join-Path $resortOutDir "${resortId}_images.json"
  $records | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8
  Export-JsonUtf8 -Obj $records -Path $jsonPath
  "Done $resortId -> $csvPath" | Tee-Object -FilePath $logPath -Append | Out-Null
}

$masterCsv  = Join-Path $masterOutDir "ALL_images.csv"
$masterJson = Join-Path $masterOutDir "ALL_images.json"
$allRecords | Export-Csv -LiteralPath $masterCsv -NoTypeInformation -Encoding UTF8
Export-JsonUtf8 -Obj $allRecords -Path $masterJson

if ($failedRecords.Count -gt 0) {
  $failedRecords | Export-Csv -LiteralPath $failedCsvPath -NoTypeInformation -Encoding UTF8
}

"Finished. Master: $masterCsv" | Tee-Object -FilePath $logPath -Append | Out-Null

if ($script:HttpClient) { $script:HttpClient.Dispose(); $script:HttpClient = $null }