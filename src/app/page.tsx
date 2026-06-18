import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

const simulatorLinks = [
  {
    title: "RMI Simulator",
    explanation:
      "توضيح كيف يستدعي Client دالة موجودة على Server آخر باستخدام RMI مع Stub و Registry و Serialization.",
    href: "/rmi-simulator",
  },
  {
    title: "Load Balancer Simulator",
    explanation:
      "عرض فكرة توزيع الطلبات على أكثر من Server عند اختلاف السرعات أو زيادة الضغط.",
    href: "/load-balancer",
  },
  {
    title: "RPC vs Message Passing",
    explanation:
      "مقارنة أسلوب الاستدعاء المباشر RPC مع إرسال الرسائل Message Passing بين الخدمات.",
    href: "/rpc-vs-message-passing",
  },
  {
    title: "Fault Tolerance Lab",
    explanation:
      "شرح التعامل مع partial failure وكيف تساعد أفكار مثل Circuit Breaker في تقليل أثر الفشل.",
    href: "/fault-tolerance",
  },
  {
    title: "Sharding & Replication",
    explanation:
      "تقديم الفرق بين تقسيم البيانات Sharding ونسخها Replication لتحسين التوسع والاعتمادية.",
    href: "/sharding-replication",
  },
  {
    title: "Final Summary",
    explanation:
      "تلخيص المفاهيم وربط المحاكيات بمشاكل Distributed Systems التي تظهر في الأنظمة العملية.",
    href: "/final-summary",
  },
];

export default function Home() {
  return (
    <PageShell
      title="Distributed Systems Practical Simulator"
      subtitle="واجهة تعليمية جامعية تشرح كيف يتحول برنامج محلي بسيط إلى Distributed System مكون من خدمات وخوادم متعددة."
    >
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">فكرة المشروع</h2>
          <p className="mt-3 leading-8 text-slate-700">
            يبدأ النظام كبرنامج محلي يستدعي دواله وبياناته داخل نفس العملية. في
            Distributed Systems تتوزع هذه الأجزاء على أكثر من خدمة أو Server،
            فيظهر تأثير الشبكة، زمن الاستجابة، وتعطل جزء من النظام دون تعطل
            باقي الأجزاء.
          </p>
          <p className="mt-3 leading-8 text-slate-700">
            في المراحل القادمة ستوضح المحاكيات مشاكل مثل latency و partial
            failure واختلاف سرعة الخوادم و network congestion، لكن هذه المرحلة
            تركز فقط على بناء الصفحات والتنقل بينها.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-950">
            الهدف الأكاديمي
          </h2>
          <p className="mt-3 leading-8 text-emerald-900">
            الهدف ليس بناء بنية تحتية حقيقية، بل تقديم تجربة مرئية بسيطة تساعد
            الطالب على مناقشة مفاهيم Distributed Systems وفهم لماذا تصبح
            الأنظمة الموزعة أكثر تعقيدا من البرنامج المحلي.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-950">
          صفحات المحاكاة
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {simulatorLinks.map((item) => (
            <ConceptCard
              key={item.href}
              title={item.title}
              explanation={item.explanation}
              href={item.href}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
