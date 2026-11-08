# خطة تكامل WhatsApp Cloud API — Orca CRM
> المصدر: [توثيق Meta للمطورين](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## نظرة عامة على البنية

```
[عملاء WhatsApp]
       ↕ رسائل
[Meta Cloud API]
       ↕ Webhook (POST)
[NestJS Backend — Orca]
       ↕ HTTP / WebSocket
[Angular Frontend — CRM Inbox]
```

---

## المرحلة الأولى: الإعداد على Meta (مرة واحدة — يديرها المسؤول)

### 1.1 إنشاء تطبيق Meta Business
- الذهاب إلى [Meta Developer Dashboard](https://developers.facebook.com/apps/)
- إنشاء تطبيق جديد من نوع **Business**
- إضافة منتج **WhatsApp** للتطبيق

### 1.2 تجهيز الحساب التجاري (WABA)
- ربط **WhatsApp Business Account (WABA)** بالتطبيق
- Meta توفر تلقائيًا:
  - حساب WABA تجريبي
  - رقم هاتف اختباري للتطوير

### 1.3 جمع المعرّفات المطلوبة
| المعرّف | الوصف | مكان الحصول عليه |
|---|---|---|
| `PHONE_NUMBER_ID` | معرف رقم الهاتف المُرسِل | App Dashboard → WhatsApp → API Setup |
| `WABA_ID` | معرف حساب WhatsApp Business | App Dashboard → WhatsApp → API Setup |
| `ACCESS_TOKEN` | رمز المصادقة | System User في Business Manager (للإنتاج) |
| `APP_SECRET` | سر التطبيق للتحقق من الـ Webhook | App Settings → Basic |
| `VERIFY_TOKEN` | توكن سري تختاره أنت | تحدده بنفسك في الـ Backend |

### 1.4 الرقم التجاري الحقيقي (للإنتاج)
- يجب أن يكون الرقم **غير مرتبط** بأي تطبيق WhatsApp عادي
- يجب أن يستطيع استقبال رسائل SMS أو مكالمات صوتية للتحقق
- التسجيل عبر: App Dashboard → WhatsApp → Phone Numbers → Add phone number

> [!IMPORTANT]
> للإنتاج: أنشئ **System User** في Business Manager واحصل على توكن دائم بصلاحيات:
> - `whatsapp_business_management`
> - `whatsapp_business_messaging`
> لا تستخدم التوكن المؤقت (ينتهي خلال 24 ساعة)

---

## المرحلة الثانية: Backend (NestJS)

### 2.1 المتغيرات البيئية
```env
# .env
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxx
WHATSAPP_WABA_ID=xxxxxxxxxx
WHATSAPP_ACCESS_TOKEN=EAAxxxxxx
WHATSAPP_APP_SECRET=xxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=my_custom_secret_token_123
WHATSAPP_API_VERSION=v21.0
```

### 2.2 Webhook Endpoint — التحقق (GET)
عندما تضع رابط الـ Webhook في Meta Dashboard، تُرسل Meta طلب `GET` للتحقق:

```typescript
// whatsapp.controller.ts
@Get('webhook')
verifyWebhook(
  @Query('hub.mode') mode: string,
  @Query('hub.verify_token') token: string,
  @Query('hub.challenge') challenge: string,
  @Res() res: Response,
) {
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge); // يجب إرجاع challenge نصاً فقط
  } else {
    res.status(403).send('Forbidden');
  }
}
```

### 2.3 Webhook Endpoint — استقبال الرسائل (POST)
```typescript
@Post('webhook')
async receiveMessage(
  @Headers('x-hub-signature-256') signature: string,
  @Body() body: any,
  @Res() res: Response,
) {
  // 1. التحقق من صحة الـ Signature (أمان)
  const isValid = this.whatsappService.verifySignature(body, signature);
  if (!isValid) return res.status(403).send('Invalid signature');

  // 2. استخراج الرسائل
  const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (messages) {
    for (const message of messages) {
      await this.whatsappService.handleIncomingMessage(message);
    }
  }

  // 3. الرد بـ 200 فوراً (مهم جداً — يجب أن يكون سريعاً)
  res.status(200).send('OK');
}
```

### 2.4 التحقق من صحة الـ Signature (HMAC-SHA256)
```typescript
verifySignature(body: any, signature: string): boolean {
  const payload = JSON.stringify(body);
  const expected = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
    .update(payload)
    .digest('hex');
  return signature === `sha256=${expected}`;
}
```

### 2.5 إرسال رسالة (Send Message API)
```typescript
async sendMessage(to: string, text: string): Promise<void> {
  const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await this.httpService.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,           // رقم الهاتف بصيغة دولية: 1xxxxxxxxxx
    type: 'text',
    text: { body: text },
  }, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }).toPromise();
}
```

### 2.6 إرسال Template Message (خارج نافذة 24 ساعة)
```typescript
async sendTemplate(to: string, templateName: string, langCode = 'ar'): Promise<void> {
  await this.httpService.post(url, {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,       // اسم القالب المعتمد مسبقاً
      language: { code: langCode },
    },
  }, { headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } }).toPromise();
}
```

> [!WARNING]
> **قاعدة 24 ساعة:** لا يمكن إرسال رسائل نصية حرة إلا خلال 24 ساعة من آخر رسالة من العميل.
> خارج هذه النافذة، يجب استخدام **Message Templates** معتمدة من Meta فقط.

---

## المرحلة الثالثة: ضبط الـ Webhook في Meta Dashboard

### الخطوات:
1. في App Dashboard → **WhatsApp → Configuration**
2. أدخل **Callback URL** مثال: `https://api.orca-crm.com/whatsapp/webhook`
3. أدخل **Verify Token** (نفس الذي في متغيرات البيئة)
4. اضغط **Verify and Save**
5. من قائمة **Webhook Fields** → اشترك في:
   - ✅ `messages` (الرسائل الواردة)
   - ✅ `message_deliveries` (حالات التسليم)
   - ✅ `message_reads` (حالات القراءة)

> [!NOTE]
> أثناء التطوير المحلي، استخدم **ngrok** لعمل HTTPS tunnel:
> ```bash
> ngrok http 3000
> # ستحصل على رابط مثل: https://abc123.ngrok.io
> # استخدمه كـ Callback URL مؤقتاً
> ```

---

## المرحلة الرابعة: تكامل Frontend (Angular CRM)

### 4.1 وحدة Inbox الموجودة
الربط يكون في `src/app/features/inbox/` — إضافة دعم WhatsApp إلى صندوق الرسائل الموحد.

### 4.2 البنية المقترحة للـ Store
```typescript
// inbox.store.ts (NgRx SignalStore)
export const InboxStore = signalStore(
  withState<InboxState>({
    conversations: [],
    activeConversationId: null,
    channel: 'all', // 'whatsapp' | 'ringcentral' | 'all'
    loading: false,
  }),
  withMethods((store, inboxService = inject(InboxService)) => ({
    async sendWhatsAppMessage(conversationId: string, text: string) {
      await inboxService.sendMessage(conversationId, text, 'whatsapp');
    },
    async loadConversations() {
      patchState(store, { loading: true });
      const data = await inboxService.getConversations();
      patchState(store, { conversations: data, loading: false });
    },
  })),
);
```

### 4.3 Real-time Updates (WebSocket)
```typescript
// inbox.service.ts
// الـ Backend يُرسل event عبر WebSocket عند وصول رسالة جديدة
this.socket.on('whatsapp:message', (message: WhatsAppMessage) => {
  this.inboxStore.addMessage(message);
});
```

### 4.4 نموذج بيانات الرسالة
```typescript
interface WhatsAppMessage {
  id: string;
  from: string;           // رقم الهاتف
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'template';
  text?: { body: string };
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
}
```

---

## المرحلة الخامسة: Message Templates (للإنتاج)

### 5.1 إنشاء Template
1. في [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/)
2. اختر الـ WABA الخاص بك
3. أنشئ قالباً جديداً:
   - **Name**: `subscription_renewal_ar`
   - **Category**: `UTILITY` أو `MARKETING`
   - **Language**: `Arabic`
   - **Body**: `مرحبًا {{1}}، اشتراكك ينتهي في {{2}}. تجديد الاشتراك؟`
4. أرسله للمراجعة (تأخذ من ساعات إلى 24 ساعة)

### القوالب المقترحة لـ Orca CRM:
| الاسم | الاستخدام |
|---|---|
| `subscription_renewal_ar` | تذكير بتجديد الاشتراك |
| `subscription_expired_ar` | إشعار انتهاء الاشتراك |
| `order_confirmation_ar` | تأكيد طلب جديد |
| `welcome_new_customer_ar` | ترحيب بعميل جديد |
| `support_ticket_ar` | إشعار فتح تذكرة دعم |

---

## المرحلة السادسة: متطلبات الإنتاج والأمان

### قائمة التحقق قبل الإطلاق:
- [ ] شهادة SSL صالحة على الـ Backend endpoint (ليست self-signed)
- [ ] System User token دائم (وليس temporary token)
- [ ] التحقق من Signature `X-Hub-Signature-256` على كل POST request
- [ ] تخزين `ACCESS_TOKEN` في متغيرات البيئة فقط — لا يظهر أبداً في الـ Frontend أو الـ logs
- [ ] رقم الهاتف مسجّل رسمياً في WhatsApp Business Manager
- [ ] Business Verification مكتملة في Meta Business Manager
- [ ] الرد على الـ Webhook بـ `200 OK` خلال 5 ثواني (المعالجة الثقيلة في queue)

### قيود مهمة:
| القيد | التفاصيل |
|---|---|
| نافذة 24 ساعة | لا رسائل حرة خارج هذه النافذة |
| حد المعدل | 80 رسالة/ثانية لكل رقم هاتف |
| Template Approval | من 1-24 ساعة للمراجعة |
| رسوم الرسائل | Meta تفرض رسوماً على بعض أنواع الرسائل |

---

## ملخص الملفات التي ستُنشأ في Orca CRM

### Backend (NestJS):
```
src/
└── whatsapp/
    ├── whatsapp.module.ts
    ├── whatsapp.controller.ts   ← Webhook endpoints
    ├── whatsapp.service.ts      ← إرسال/استقبال + signature verification
    ├── whatsapp.dto.ts          ← أنواع البيانات
    └── whatsapp.types.ts        ← WhatsAppMessage interface
```

### Frontend (Angular):
```
src/app/features/inbox/
├── inbox.store.ts              ← إضافة WhatsApp state
├── inbox.service.ts            ← إضافة WhatsApp channel
└── components/
    └── message-composer/       ← إضافة خيار channel (WA / RC)
```

---

## الخطوات الفورية التالية

1. **الآن**: إنشاء Meta Developer App وجمع الـ IDs
2. **يوم 1**: بناء Webhook endpoint في NestJS + اختباره بـ ngrok
3. **يوم 2**: اختبار الإرسال والاستقبال مع الرقم التجريبي
4. **يوم 3**: ربط الـ Frontend (Inbox store + UI)
5. **يوم 4-7**: إنشاء وتقديم Message Templates للمراجعة
6. **قبل الإطلاق**: تسجيل الرقم الحقيقي + System User token + اختبار شامل
