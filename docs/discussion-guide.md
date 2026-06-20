# دليل مناقشة مشروع Distributed Systems Practical Simulator

## فكرة المشروع بجملة واضحة

المشروع هو تطبيق تعليمي تفاعلي يحوّل مفاهيم **Distributed Systems** من تعريفات نظرية إلى سلوك مرئي يستطيع المستخدم تشغيله وتغيير ظروفه وملاحظة نتائجه.

## لماذا Distributed Systems أصعب من local program؟

في **local program** يحدث التنفيذ غالباً داخل process واحدة وعلى جهاز واحد، لذلك يكون استدعاء function مباشراً، والـ latency منخفضة، وحالة الفشل أبسط. في **Distributed System** تتوزع المسؤوليات على services أو nodes منفصلة وتتواصل عبر network، وهذا يضيف تحديات أساسية:

- الـ network قد تتأخر أو تنقطع، لذلك تصبح latency متغيرة.
- قد تفشل service واحدة بينما تبقى بقية الخدمات والـ client تعمل؛ وهذا يسمى **Partial Failure**.
- يجب تحديد مكان الـ service أو البيانات قبل الوصول إليها.
- تحتاج الطلبات إلى routing وتوزيع حمل ومراقبة صحة الـ nodes.
- يجب اختيار نموذج التواصل المناسب: synchronous مثل **RPC** أو asynchronous مثل **Message Passing**.
- تحتاج البيانات إلى توزيع ونسخ لتحقيق scalability وavailability.

الفكرة الأساسية التي يجب قولها: توزيع النظام يعطي scalability وavailability وفصل المسؤوليات، لكنه يجعل الاتصال والتنسيق والتعامل مع الفشل جزءاً من تصميم النظام.

## شرح صفحات المشروع

### 1. Home — `/`

**ماذا تعرض؟**  
تعرض الفرق بين **Local Program** و**Distributed System**، وتوضح مسار الطلب عبر عدة services مع حالات network congestion وpartial failure.

**ماذا يفعل المستخدم؟**  
يشغّل Local Request ثم Distributed Request، ويفعّل congestion أو partial failure ليلاحظ اختلاف الزمن والنتيجة.

**ما المفهوم الذي تثبته؟**  
تثبت أن الطلب المحلي مباشر، بينما الطلب الموزع يعبر network boundaries ويتأثر بالتأخير وبفشل جزء واحد من النظام.

**جملة جاهزة للمناقشة:**  
"هذه الصفحة تضع أساس المشروع: التوزيع لا يعني وجود عدة servers فقط، بل يعني وجود communication cost واحتمال partial failure بين أجزاء النظام."

### 2. RMI Simulator — `/rmi-simulator`

**ماذا تعرض؟**  
تعرض مقارنة بين local call وremote call، ومسار الاستدعاء عبر **Stub** و**RMI Registry** وserialization ثم remote execution والعودة بالنتيجة.

**ماذا يفعل المستخدم؟**  
يشغّل الاستدعاء خطوة بخطوة، يجري Registry lookup، ويلاحظ الفرق بين pass-by-value وRemote object reference.

**ما المفهوم الذي تثبته؟**  
تثبت أن **RMI** يجعل remote call يبدو قريباً من local method call من ناحية البرمجة، لكنه يظل مرتبطاً بالـ serialization والـ network والـ remote service واحتمالات فشلها.

**جملة جاهزة للمناقشة:**  
"الـ RMI يخفي تفاصيل الاتصال خلف method-call interface، لكنه لا يلغي latency أو remote failure."

### 3. Load Balancer Simulator — `/load-balancer`

**ماذا تعرض؟**  
تعرض clients ترسل requests إلى **Load Balancer** يختار backend server وفق algorithm محددة، مع إظهار صحة كل server وحمله.

**ماذا يفعل المستخدم؟**  
يرسل traffic، يبدّل بين algorithms مثل **Round Robin** و**Least Connections**، ويغيّر server health ليرى كيف يتغير routing.

**ما المفهوم الذي تثبته؟**  
تثبت أن سياسة توزيع الطلبات وHealth Checks تؤثر مباشرة في عدالة التوزيع، response time، scalability، وHigh Availability.

**جملة جاهزة للمناقشة:**  
"الـ Load Balancer لا يوزع الطلبات عشوائياً؛ القرار يعتمد على algorithm وعلى حالة الـ backend servers."

### 4. RPC vs Message Passing — `/rpc-vs-message-passing`

**ماذا تعرض؟**  
تعرض مسارين: **RPC** مباشر ينتظر فيه client الاستجابة، و**Message Passing** يمر فيه العمل من Producer إلى Queue ثم Consumer.

**ماذا يفعل المستخدم؟**  
يشغّل RPC request، يرسل messages، يوقف Consumer ثم يستمر في الإنتاج ويراقب زيادة Queue length، وبعدها يعيد تشغيل Consumer لمعالجة الرسائل.

**ما المفهوم الذي تثبته؟**  
تثبت أن RPC يربط الطرفين زمنياً، بينما Queue تفصل Producer عن Consumer وتسمح لكل منهما بالعمل في وقت وسرعة مختلفين.

**جملة جاهزة للمناقشة:**  
"الفرق الرئيسي هو coupling: في RPC ينتظر caller نتيجة مباشرة، أما Message Passing فيفصل الإرسال عن المعالجة بواسطة Queue."

### 5. Fault Tolerance Lab — `/fault-tolerance`

**ماذا تعرض؟**  
تعرض **Retry + Backoff** و**Circuit Breaker** و**Fallback** و**Health Check** و**Heartbeat** عند فشل primary service وتعافيها.

**ماذا يفعل المستخدم؟**  
يغيّر service health، يرسل requests، يراقب retry attempts وتأخير backoff وحالات Circuit Breaker، ويفعّل أو يعطّل Fallback ويجري Health Check.

**ما المفهوم الذي تثبته؟**  
تثبت أن Fault Tolerance لا تمنع حدوث الفشل، بل تتحكم في أثره: تعيد المحاولة بحذر، توقف الطلبات الضارة المتكررة، تقدم استجابة بديلة، وتكتشف التعافي.

**جملة جاهزة للمناقشة:**  
"الهدف ليس الادعاء بأن الفشل لن يحدث، بل إبقاء النظام مفيداً ومنع فشل dependency واحدة من استنزاف بقية النظام."

### 6. Sharding & Replication — `/sharding-replication`

**ماذا تعرض؟**  
تعرض توزيع records على Shards بواسطة **Shard Key**، ثم تقارن بين **Active Replication** و**Passive Replication** مع حالات فشل وتعافي nodes.

**ماذا يفعل المستخدم؟**  
يولّد records، يختار Shard Key، يتتبع قرار وضع البيانات، يبدّل replication mode، وينفذ writes ويراقب النسخ المتاحة عند failure.

**ما المفهوم الذي تثبته؟**  
تثبت أن Sharding يحل مشكلة توزيع البيانات والحمل، بينما Replication تضيف نسخاً تدعم availability وfault tolerance.

**جملة جاهزة للمناقشة:**  
"Sharding يحدد أين توضع البيانات، وReplication تحدد كيف نحافظ على نسخ منها عند فشل node."

### 7. Final Summary — `/final-summary`

**ماذا تعرض؟**  
تعرض proof cards وconcept matrix تربط كل simulator بالمفهوم والسلوك المرئي والنتيجة الأكاديمية.

**ماذا يفعل المستخدم؟**  
يراجع مسار المشروع كاملاً ويستخدم الخلاصة للربط بين الصفحات ومفاهيم المادة.

**ما المفهوم الذي تثبته؟**  
تثبت أن فهم Distributed Systems يحتاج صورة مترابطة تشمل communication، routing، failure handling، وdata distribution.

**جملة جاهزة للمناقشة:**  
"الخلاصة تجمع الصفحات في حجة واحدة: النظام الموزع هو تواصل وقرارات توزيع وآليات تحمل فشل وإدارة بيانات موزعة."

## نقاط قوة المشروع

- يحوّل المفهوم النظري إلى interaction ونتيجة يمكن ملاحظتها.
- يربط كل صفحة بسؤال أكاديمي واضح ودليل مرئي.
- يقدم learning path مترابطاً يبدأ بسبب التوزيع وينتهي بتوزيع البيانات وتحمّل الفشل.
- يسمح بتغيير conditions ومقارنة النتائج بدلاً من حفظ تعريف واحد ثابت.
- يفصل بوضوح بين communication models وبين أدوار routing وfault tolerance وdata distribution.
- يستخدم مصطلحات المادة ضمن واجهة منظمة تساعد على العرض والمناقشة.

## طريقة شرح المشروع أمام الدكتور

1. ابدأ بالمشكلة: local program بسيط، لكن جهازاً واحداً له حدود في capacity وavailability.
2. قدّم المشروع كإجابة تعليمية: كل صفحة تختبر قراراً أساسياً في Distributed Systems.
3. لا تصف عناصر الواجهة فقط؛ استخدم الصيغة: **interaction → observation → concept**.
4. نفّذ سيناريو واحداً واضحاً في كل صفحة، ثم قل ما الذي أثبته.
5. اربط نهاية كل صفحة ببداية التالية: remote communication، ثم توزيع الطلبات، ثم نماذج التواصل، ثم تحمل الفشل، ثم توزيع البيانات.
6. اختم من Final Summary بجملة تجمع الدليل: التوزيع يحقق فوائد مهمة لكنه يتطلب إدارة الاتصال والفشل والبيانات.

مثال لطريقة الشرح: "أوقفت Consumer واستمر Producer في إضافة messages إلى Queue. الملاحظة هي أن الإرسال لم يتوقف. هذا يثبت temporal decoupling في Message Passing."

## أخطاء يجب تجنبها أثناء الشرح

- سرد أسماء التقنيات من دون توضيح السلوك الذي تثبته.
- القول إن Distributed Systems تعني فقط "أكثر من server".
- الخلط بين Stub وRMI Registry: الأول client-side proxy، والثاني service lookup.
- القول إن Load Balancer يمنع server failure؛ دوره يوزع traffic ويتجنب unhealthy servers وفق Health Checks.
- القول إن Round Robin يختار أخف server؛ هذا أقرب إلى Least Connections.
- وصف RPC بأنه دائماً أفضل أو Message Passing بأنه دائماً أفضل؛ الاختيار يعتمد على الحاجة إلى response مباشر ودرجة coupling المطلوبة.
- القول إن Retry يجب أن يكون فورياً وبلا حد؛ التكرار غير المنضبط يزيد الضغط.
- الخلط بين Circuit Breaker وRetry؛ الأول يوقف calls مؤقتاً بعد failures متكررة، والثاني يعيد المحاولة.
- الخلط بين Sharding وReplication؛ الأول partitions البيانات، والثاني ينشئ copies.
- قراءة النص من الشاشة حرفياً بدلاً من تفسير interaction والنتيجة.
- استخدام عبارات مترددة أو اعتذارية؛ اشرح scope المشروع وهدف كل simulation بصورة مباشرة.

## أسئلة متوقعة وأجوبة نموذجية

### Why did you choose a simulator instead of static pages?

لأن static page تعرض تعريفاً، أما simulator فيسمح للمستخدم بتغيير حالة النظام ومشاهدة النتيجة. عندما أوقف Consumer أو أفشل service أو أبدّل algorithm تظهر آثار القرار مباشرة، وهذا يقدم evidence على فهم المفهوم وليس مجرد عرضه كنص.

### What is the difference between local call and remote call?

الـ local call ينفذ داخل process نفسها ويصل إلى function مباشرة. الـ remote call يعبر process أو machine boundary، ويحتاج serialization وtransport وremote execution ثم response، لذلك يتأثر بالـ latency وبـ partial failure.

### What is the role of Stub in RMI?

الـ **Stub** هو client-side proxy يمثل الـ remote object محلياً. يستقبل method call، يجهز اسم method والarguments للنقل، ويرسل الطلب ثم يعيد النتيجة للـ client بطريقة تشبه الاستدعاء المحلي.

### What is the role of RMI Registry?

الـ **RMI Registry** يقدم lookup أو service discovery. يربط service name مثل `BankService` بالـ remote reference الذي يحتاجه client للوصول إلى الخدمة.

### Why can a remote call fail even if the client is working?

لأن نجاح client لا يضمن نجاح network أو Registry أو remote service. قد تكون الخدمة متوقفة، أو الاتصال متأخراً أو منقطعاً، لذلك يحدث partial failure رغم استمرار client بالعمل.

### Why do we need Load Balancing?

نحتاجه لتوزيع incoming requests على عدة backend servers بدلاً من تحميل server واحدة كل العمل. هذا يحسن استخدام الموارد وscalability وresponse time، ويسمح بإبعاد traffic عن unhealthy server.

### What is the difference between Round Robin and Least Connections?

**Round Robin** يوزع الطلبات بالتتابع الدوري بين servers المؤهلة من دون الاعتماد الأساسي على حملها الحالي. **Least Connections** يختار server التي لديها أقل عدد من active connections، لذلك يتفاعل مع الحمل الجاري.

### Why do Health Checks matter?

لأن Load Balancer يحتاج معلومات حديثة عن صلاحية backend server. من دون Health Checks قد يرسل traffic إلى server غير قادرة على الاستجابة، أما معها فيستبعد unhealthy nodes ويعيدها بعد recovery.

### What is the difference between RPC and Message Passing?

في **RPC** يرسل caller طلباً مباشراً إلى service وينتظر response، فيوجد synchronous temporal coupling. في **Message Passing** يرسل Producer رسالة إلى Queue، ويمكن للـ Consumer معالجتها لاحقاً، فيقل coupling بين الطرفين.

### How does a Queue decouple services?

الـ Queue تخزن messages بين Producer وConsumer. لذلك لا يحتاج Producer إلى أن يكون Consumer متاحاً في لحظة الإرسال، ويمكن للطرفين العمل بسرعات وأوقات مختلفة.

### What is Retry + Backoff?

**Retry** هو إعادة محاولة operation بعد failure قد يكون مؤقتاً. **Backoff** يضيف فترات انتظار متزايدة بين المحاولات، مثل 1 ثم 2 ثم 4 ثوانٍ، لتجنب زيادة الضغط على service المتعثرة.

### What is Circuit Breaker?

هو pattern يراقب failures. بعد تكرارها ينتقل إلى Open ويوقف calls مؤقتاً، ثم قد ينتقل إلى Half-Open لاختبار recovery، وإذا نجح الاختبار يعود إلى Closed. هدفه منع الطلبات غير المفيدة وحماية الموارد.

### What is Fallback?

الـ **Fallback** هو مسار بديل يعطي استجابة مقبولة عندما لا تتوفر primary service، مثل قيمة آمنة أو نتيجة من cache. يحافظ على جزء مفيد من الخدمة بدلاً من انهيار كامل للطلب.

### What is a Shard Key?

الـ **Shard Key** هو field أو قيمة تستخدمها routing function لتحديد الـ shard التي ستخزن record. اختيارها يؤثر في توزيع البيانات والحمل وسهولة الوصول.

### What is the difference between Active Replication and Passive Replication?

في **Active Replication** تشارك replicas في تنفيذ أو استقبال operation بصورة متوازية وتحافظ على نسخ متزامنة. في **Passive Replication** تنفذ Primary العملية أولاً ثم تنقل state أو update إلى Backups، وتستلم إحدى النسخ الدور عند فشل Primary.

### How does this project prove understanding of Distributed Systems?

لأن كل مفهوم مرتبط بسلوك قابل للتشغيل والملاحظة: remote call يعبر Stub وRegistry، والطلبات تتغير وجهتها وفق Load Balancing، والـ Queue تفصل الخدمات، وFault Tolerance تحتوي أثر الفشل، وShard Key وReplication يحددان توزيع البيانات وتوفرها. الربط بين action وresult وconcept يثبت فهماً عملياً مترابطاً.

### What is Partial Failure?

هو فشل جزء من النظام بينما تستمر أجزاء أخرى بالعمل. مثال ذلك أن client وService A يعملان بينما Service C متوقفة. هذه الحالة تميز Distributed Systems لأن حالة النظام ليست نجاحاً كاملاً أو فشلاً كاملاً دائماً.

### Why should Retry be limited?

لأن retries السريعة وغير المحدودة قد تضاعف traffic على service المتعثرة وتزيد المشكلة. لذلك تستخدم limits وBackoff، وغالباً تتكامل مع Circuit Breaker.

### What is the difference between Sharding and Replication?

**Sharding** يقسم مجموعة البيانات إلى partitions مختلفة موزعة على nodes. **Replication** يحتفظ بنسخ من البيانات على أكثر من node. الأول يركز على distribution وcapacity، والثاني على redundancy وavailability.
