# نص عرض مشروع Distributed Systems Practical Simulator

> مدة العرض المستهدفة: من 3 إلى 5 دقائق.

## Opening

السلام عليكم. مشروعي هو **Distributed Systems Practical Simulator**، وهو تطبيق تعليمي تفاعلي يوضح مفاهيم Distributed Systems من خلال simulations مرئية يمكن تشغيلها وملاحظة نتائجها. الفكرة الأساسية في العرض هي أن النظام الموزع لا يعني فقط وجود عدة servers، بل يعني أيضاً communication عبر network، وقرارات routing، واحتمال partial failure، والحاجة إلى إدارة البيانات والتوفر.

## Project idea

الـ local program أبسط لأن الاستدعاءات تحدث غالباً داخل process واحدة. عند توزيع النظام على services منفصلة نحصل على scalability وفصل للمسؤوليات وavailability أفضل، لكننا نضيف latency متغيرة، وتنسيقاً بين الأجزاء، واحتمال أن يفشل جزء بينما تستمر بقية الأجزاء. لذلك صممت المشروع كمسار عملي: كل صفحة تعرض interaction، ثم observation، ثم المفهوم الذي تثبته.

## Home explanation

في صفحة **Home** أقارن Local Request مع Distributed Request. الطلب المحلي يصل مباشرة إلى function، بينما الطلب الموزع يمر عبر عدة services. يمكنني تفعيل Network Congestion فألاحظ زيادة الزمن، أو تفعيل Partial Failure فتفشل service محددة بينما يبقى client وبقية المسار يعملان. هذه الصفحة تثبت أن network cost وpartial failure جزءان أساسيان من Distributed Systems.

## RMI Simulator explanation

بعد ذلك أنتقل إلى **RMI Simulator**. هنا يظهر remote method call بطريقة تشبه local call، لكن المسار يوضح ما يحدث خلف الواجهة: client يستدعي Local Stub، والـ Stub يجهز arguments، ثم يحدث lookup في RMI Registry للوصول إلى `BankService`، وبعد serialization يعبر الطلب الشبكة وينفذ على remote object ثم تعود النتيجة. هذا يثبت أن RMI يبسط طريقة الاستدعاء للمبرمج، لكنه لا يلغي latency أو اعتماد العملية على Registry وnetwork وremote service.

## Load Balancer Simulator explanation

في **Load Balancer Simulator** تصل requests إلى Load Balancer ثم توزع على backend servers حسب algorithm مختارة. عند استخدام Round Robin يكون التوزيع دورياً، وعند استخدام Least Connections يختار النظام server ذات active connections الأقل. وعندما تصبح server unhealthy تستبعدها Health Checks من الاختيارات. هذا يثبت أن routing policy وحالة الـ servers تؤثران في scalability وresponse time وHigh Availability.

## RPC vs Message Passing explanation

صفحة **RPC vs Message Passing** تقارن نموذجين للتواصل. في RPC يرسل client طلباً مباشراً وينتظر response، لذلك يكون مرتبطاً زمنياً بالخدمة. في Message Passing يرسل Producer الرسالة إلى Queue ثم يعالجها Consumer. إذا أوقفت Consumer يستمر Producer في إرسال messages وتبقى الرسائل في Queue حتى يعود Consumer. هذا السلوك يثبت أن Queue تحقق decoupling وتسمح للطرفين بالعمل في أوقات وسرعات مختلفة.

## Fault Tolerance Lab explanation

في **Fault Tolerance Lab** أختبر استجابة النظام للفشل. Retry يعيد المحاولة، وBackoff يزيد الانتظار بين المحاولات حتى لا نضغط على service المتعثرة. بعد failures متكررة يفتح Circuit Breaker ويوقف calls مؤقتاً، ثم يختبر recovery في Half-Open. يمكن أيضاً استخدام Fallback لإرجاع استجابة بديلة، بينما Health Check وHeartbeat يكشفان حالة الخدمة وتعافيها. هذه الصفحة تثبت أن Fault Tolerance تعني احتواء أثر الفشل والمحافظة على سلوك مفيد للنظام.

## Sharding & Replication explanation

في **Sharding & Replication** أتعامل مع توزيع البيانات. الـ Shard Key يحدد أي shard تستقبل كل record، وبذلك تتوزع البيانات والحمل. ثم أقارن بين Active Replication، حيث تشارك replicas في التعامل مع العمليات، وPassive Replication، حيث تنفذ Primary العملية وتنتقل updates إلى Backups. عند فشل node تبين النسخ كيف تستمر availability. النتيجة هي أن Sharding يعالج data placement وcapacity، بينما Replication تضيف redundancy وfault tolerance.

## Final Summary explanation

أخيراً، صفحة **Final Summary** تربط كل simulator بالمفهوم الذي يثبته وبالدليل الذي شاهده المستخدم. المسار الكامل يبدأ بتكلفة الاتصال، ثم remote invocation وتوزيع الطلبات، ثم اختيار communication model، وبعدها احتواء الفشل، وينتهي بتوزيع البيانات وحماية توفرها.

## Closing statement

الخلاصة أن المشروع يقدم فهماً مترابطاً لـ Distributed Systems: الفوائد مثل scalability وavailability تحتاج قرارات واضحة في communication وrouting وfailure handling وdata distribution. وكل قرار في المشروع مرتبط بتجربة مرئية ونتيجة يمكن تفسيرها أكاديمياً. شكراً لكم.
