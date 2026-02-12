import { redirect } from "next/navigation";

export default function HomePage() {
  // خلي الصفحة الرئيسية تودّي المستخدم مباشرة لقائمة الشاليهات
  redirect("/resorts");
}
