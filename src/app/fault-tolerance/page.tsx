import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function FaultTolerancePage() {
  return (
    <PageShell
      title="Fault Tolerance Lab"
      subtitle="صفحة ثابتة تمهد لفهم كيف يستمر النظام الموزع عندما يفشل جزء منه."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستحاكيه الصفحة؟"
          explanation="ستعرض لاحقا سيناريو partial failure حيث يتعطل Server أو يصبح بطيئا بينما تبقى أجزاء أخرى من النظام تعمل."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن Fault Tolerance لا يعني منع الفشل، بل تقليل أثره باستخدام أفكار مثل retry المحدود و Circuit Breaker ضمن نطاق المحاضرة."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيلاحظ كيف يتغير سلوك النظام عند فشل خدمة، وكيف يمكن عزل الفشل بدلا من نشره إلى كل الطلبات."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="لا توجد failure toggles أو timers أو منطق retry الآن. هذه الصفحة تعرض الهيكل والمحتوى فقط."
        />
      </section>
    </PageShell>
  );
}
