# دليل البدء السريع للتطوير الآمن

## الوضع الحالي

✅ **أنت الآن في branch آمن:** `development/optimization-phase1`  
✅ **النسخة الأصلية محفوظة في:** `main`  
✅ **يمكنك الرجوع في أي وقت بدون خسارة**

## البدء في المرحلة 1 (الأسهل والأكثر أماناً)

### الخطوة 1: تنفيذ سكريبت التنظيف

```bash
# تأكد أنك في branch التطوير
git branch  # يجب أن ترى * development/optimization-phase1

# نفذ السكريبت
./scripts/phase1-cleanup-dependencies.sh
```

### الخطوة 2: إعادة التثبيت

```bash
pnpm install
```

### الخطوة 3: اختبار المشروع

```bash
# شغل المشروع
pnpm dev

# افتح المتصفح على http://localhost:3000
# اختبر:
# ✅ الصفحة الرئيسية
# ✅ صفحة النواب
# ✅ صفحة الشكاوى
# ✅ لوحة التحكم
```

### الخطوة 4أ: إذا كل شيء شغال ✅

```bash
# احفظ التغييرات
git add .
git commit -m "chore: remove 85 unused dependencies - Phase 1 complete"

# ادمج في main (اختياري - يمكنك الانتظار)
# git checkout main
# git merge development/optimization-phase1
```

### الخطوة 4ب: إذا حصلت مشكلة ❌

```bash
# ارجع للنسخة الأصلية فوراً
git checkout main

# احذف branch التطوير
git branch -D development/optimization-phase1

# أو استرجع package.json القديم
cp package.json.backup package.json
pnpm install
```

---

## الانتقال للمرحلة 2 (بعد نجاح المرحلة 1)

```bash
# إنشاء branch جديد للمرحلة 2
git checkout -b development/optimization-phase2

# اتبع الخطوات في OPTIMIZATION_ROADMAP.md
```

---

## أوامر مهمة للطوارئ

### الرجوع لآخر commit شغال
```bash
git reset --hard HEAD~1
pnpm install
```

### الرجوع للنسخة الأصلية تماماً
```bash
git checkout main
git branch -D development/optimization-phase*
```

### عمل backup يدوي
```bash
# قبل أي تغيير كبير
cp -r . ../naebak-xx-backup-$(date +%Y%m%d-%H%M%S)
```

### فحص الفروق بين النسخة الحالية والأصلية
```bash
git diff main
```

---

## نصائح مهمة

1. ✅ **لا تستعجل** - اختبر كل مرحلة جيداً
2. ✅ **commit بعد كل تغيير ناجح** - سهولة الرجوع
3. ✅ **اختبر على localhost أولاً** - قبل deploy
4. ✅ **احتفظ بـ backup من قاعدة البيانات** - للأمان
5. ✅ **اقرأ OPTIMIZATION_ROADMAP.md** - للخطة الكاملة

---

## جدول المراحل

| المرحلة | الوصف | المدة | الخطورة |
|:---:|:---|:---:|:---:|
| 1 | تنظيف التبعيات | 2-3 ساعات | 🟢 منخفضة |
| 2 | تنظيف الملفات | 1-2 ساعة | 🟢 منخفضة |
| 3 | إزالة console.log | 2-3 ساعات | 🟡 متوسطة |
| 4 | توحيد className | 1 ساعة | 🟡 منخفضة |
| 5 | تحسين الصور | 2-3 ساعات | 🟠 متوسطة |
| 6 | Lazy Loading | 4-6 ساعات | 🔴 عالية |
| 7 | تحسين Caching | 6-8 ساعات | 🔴 عالية |
| 8 | إعادة الهيكلة | 2-3 أسابيع | 🔴 عالية |

---

## الدعم

إذا واجهت أي مشكلة:
1. ارجع للنسخة الأصلية فوراً
2. راجع OPTIMIZATION_ROADMAP.md
3. اقرأ رسائل الأخطاء في Console
4. تحقق من git log للتغييرات الأخيرة

---

**هل أنت جاهز للبدء؟** 🚀

قم بتنفيذ:
```bash
./scripts/phase1-cleanup-dependencies.sh
```
