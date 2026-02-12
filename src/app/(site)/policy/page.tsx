import { resorts } from "@/assets/resorts";

export default function PolicyPage() {
  const policy = resorts[0]?.policy || [];

  return (
    <main className="pt-28">
      <section className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
        <h1 className="text-3xl font-semibold mb-3 underline py-3 ">السياسات والتعليمات</h1>
        <p className="mt-2 text-gray-600">
          عشان الكل يستانس، هذي القوانين الأساسية. إذا عندك سؤال كلّمنا.
        </p>

        <div className="p-6 mt-6 border rounded-2xl border-gray-3">
          {policy.length ? (
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              {policy.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-600">لا توجد سياسات حالياً.</p>
          )}
        </div>
      </section>
    </main>
  );
}
