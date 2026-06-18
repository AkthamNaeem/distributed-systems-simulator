import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function RpcVsMessagePassingPage() {
  return (
    <PageShell
      title="RPC vs Message Passing"
      subtitle="صفحة ثابتة تقارن بين استدعاء خدمة بشكل مباشر وبين التواصل عبر رسائل."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستحاكيه الصفحة؟"
          explanation="ستعرض لاحقا الفرق بين RPC كاستدعاء يبدو مثل الدالة العادية، و Message Passing كإرسال رسالة بين مكونات مستقلة."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن طريقة التواصل تؤثر على الترابط بين الخدمات، زمن الاستجابة، وكيفية التعامل مع التعطل الجزئي."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيختار نمط التواصل ويرى مسار الطلب أو الرسالة، ثم يقارن وضوح الخطوات والاعتماد بين الطرفين."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="لا يوجد تنفيذ حقيقي لأي broker مثل RabbitMQ أو Kafka، ولا توجد queues أو منطق رسائل بعد."
        />
      </section>
    </PageShell>
  );
}
