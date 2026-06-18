import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function RmiSimulatorPage() {
  return (
    <PageShell
      title="RMI Simulator"
      subtitle="صفحة ثابتة تمهد لمحاكاة Remote Method Invocation بين Client و Server."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستحاكيه الصفحة؟"
          explanation="ستعرض لاحقا رحلة استدعاء دالة بعيدة من Client إلى Server عبر Stub و Registry، ثم رجوع النتيجة بعد Serialization."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن RMI يخفي تفاصيل الشبكة جزئيا، لكن الاستدعاء يبقى موزعا ويتأثر بالزمن والفشل والاتصال بين العمليات."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيختار دالة بعيدة ويرى خطوات البحث في Registry وتجهيز البيانات وإرسال الطلب واستقبال الرد بشكل بصري."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="لا توجد أي محاكاة أو منطق تفاعلي الآن. تنفيذ منطق RMI التعليمي سيكون في مرحلة لاحقة."
        />
      </section>
    </PageShell>
  );
}
