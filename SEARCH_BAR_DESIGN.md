# 🔍 تصميم Search Bar - وثيقة التخطيط

**التاريخ:** 1 نوفمبر 2025  
**المهمة:** Task 11 - إضافة Search Bar شامل  
**الحالة:** 🔄 قيد التخطيط

---

## 📋 المتطلبات

### الوظائف الأساسية:
1. ✅ البحث عن النواب (بالاسم العربي/الإنجليزي)
2. ✅ البحث عن الشكاوى العامة (بالعنوان/المحتوى)
3. ✅ Autocomplete مع عرض النتائج أثناء الكتابة
4. ✅ Keyboard shortcuts (Ctrl+K / Cmd+K)
5. ✅ Debouncing لتحسين الأداء
6. ✅ صفحة نتائج بحث شاملة
7. ✅ دعم RTL (Right-to-Left)
8. ✅ Responsive design (موبايل + ديسكتوب)

### المتطلبات غير الوظيفية:
- ⚡ سرعة استجابة < 500ms
- ♿ Accessibility (ARIA labels, keyboard navigation)
- 📱 Mobile-friendly
- 🎨 متناسق مع نظام الألوان (أخضر)

---

## 🏗️ البنية المعمارية

### 1. Components Structure

```
src/components/search/
├── SearchBar.tsx              # المكون الرئيسي
├── SearchButton.tsx           # زر فتح البحث (في Navbar)
├── SearchDialog.tsx           # Modal/Dialog للبحث
├── SearchInput.tsx            # حقل الإدخال
├── SearchResults.tsx          # عرض النتائج (Autocomplete)
├── SearchResultItem.tsx       # عنصر واحد من النتائج
└── useSearch.ts               # Custom hook للبحث
```

### 2. Server Actions

```
src/app/actions/search/
├── searchDeputies.ts          # البحث عن النواب
├── searchComplaints.ts        # البحث عن الشكاوى
└── globalSearch.ts            # البحث الشامل (نواب + شكاوى)
```

### 3. Search Results Page

```
src/app/[locale]/(external-pages)/search/
└── page.tsx                   # صفحة نتائج البحث الكاملة
```

---

## 🎨 UI/UX Design

### Desktop View:
```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  [النواب] [الشكاوى]    [🔍 ابحث... Ctrl+K]    │
└─────────────────────────────────────────────────────────┘
```

عند الضغط على Ctrl+K أو الزر:
```
┌───────────────────────────────────────────────────────┐
│                                                       │
│   ┌─────────────────────────────────────────────┐   │
│   │  🔍  ابحث عن نواب أو شكاوى...           │   │
│   └─────────────────────────────────────────────┘   │
│                                                       │
│   📊 النواب (3)                                      │
│   ┌─────────────────────────────────────────────┐   │
│   │  👤 أحمد محمد - القاهرة                    │   │
│   │  👤 محمد علي - الجيزة                      │   │
│   │  👤 علي حسن - الإسكندرية                  │   │
│   └─────────────────────────────────────────────┘   │
│                                                       │
│   📝 الشكاوى (2)                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │  📄 مشكلة في الطرق - القاهرة               │   │
│   │  📄 نقص الخدمات - الجيزة                   │   │
│   └─────────────────────────────────────────────┘   │
│                                                       │
│   عرض جميع النتائج (5) →                            │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Mobile View:
```
┌─────────────────────────┐
│  [☰]  [Logo]  [🔍]     │
└─────────────────────────┘
```

عند الضغط على 🔍:
```
┌─────────────────────────┐
│  [←]  [🔍 ابحث...]     │
├─────────────────────────┤
│  📊 النواب              │
│  • أحمد محمد            │
│  • محمد علي             │
│                         │
│  📝 الشكاوى             │
│  • مشكلة في الطرق       │
│                         │
│  عرض الكل →             │
└─────────────────────────┘
```

---

## 🔧 التنفيذ التقني

### 1. Search API (Server Actions)

#### `src/app/actions/search/globalSearch.ts`
```typescript
'use server';

export async function globalSearch(query: string) {
  // البحث في النواب
  const deputies = await searchDeputies(query);
  
  // البحث في الشكاوى
  const complaints = await searchComplaints(query);
  
  return {
    deputies: deputies.slice(0, 5), // أول 5 نتائج
    complaints: complaints.slice(0, 5),
    totalDeputies: deputies.length,
    totalComplaints: complaints.length,
  };
}
```

#### `src/app/actions/search/searchDeputies.ts`
```typescript
'use server';

export async function searchDeputies(query: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('deputies')
    .select('*')
    .or(`name_ar.ilike.%${query}%,name_en.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(10);
  
  return data || [];
}
```

#### `src/app/actions/search/searchComplaints.ts`
```typescript
'use server';

export async function searchComplaints(query: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('public_complaints')
    .select('*, governorates(*)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10);
  
  return data || [];
}
```

---

### 2. Search Component

#### `src/components/search/SearchBar.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { globalSearch } from '@/app/actions/search/globalSearch';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    const data = await globalSearch(searchQuery);
    setResults(data);
    setIsLoading(false);
  };
  
  return (
    // Implementation...
  );
}
```

---

### 3. Debounce Hook

#### `src/hooks/useDebounce.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 🎯 خطة التنفيذ

### Phase 1: إنشاء Search API
1. ✅ إنشاء `src/app/actions/search/searchDeputies.ts`
2. ✅ إنشاء `src/app/actions/search/searchComplaints.ts`
3. ✅ إنشاء `src/app/actions/search/globalSearch.ts`
4. ✅ اختبار APIs

### Phase 2: بناء Search Components
1. ✅ إنشاء `src/hooks/useDebounce.ts`
2. ✅ إنشاء `src/components/search/SearchButton.tsx`
3. ✅ إنشاء `src/components/search/SearchDialog.tsx`
4. ✅ إنشاء `src/components/search/SearchResults.tsx`
5. ✅ إضافة SearchButton في Navbar

### Phase 3: Keyboard Shortcuts & UX
1. ✅ إضافة Ctrl+K / Cmd+K
2. ✅ إضافة Escape للإغلاق
3. ✅ إضافة Arrow keys للتنقل
4. ✅ إضافة Enter للاختيار
5. ✅ تحسين Loading states

### Phase 4: Search Results Page
1. ✅ إنشاء `/search` page
2. ✅ عرض جميع النتائج مع pagination
3. ✅ إضافة فلاتر (نواب/شكاوى)

### Phase 5: Testing & Deployment
1. ✅ اختبار البحث عن نواب
2. ✅ اختبار البحث عن شكاوى
3. ✅ اختبار Keyboard shortcuts
4. ✅ اختبار على الموبايل
5. ✅ اختبار الأداء
6. ✅ Commit & Push
7. ✅ Vercel deployment

---

## ♿ Accessibility Requirements

### ARIA Labels:
- `aria-label="ابحث عن نواب أو شكاوى"` للـ input
- `role="combobox"` للـ search input
- `role="listbox"` للنتائج
- `role="option"` لكل نتيجة
- `aria-expanded` للـ dialog state
- `aria-activedescendant` للعنصر المحدد

### Keyboard Navigation:
- **Ctrl+K / Cmd+K:** فتح البحث
- **Escape:** إغلاق البحث
- **Arrow Down/Up:** التنقل بين النتائج
- **Enter:** اختيار النتيجة
- **Tab:** التنقل بين العناصر

---

## 📊 Performance Optimization

### Debouncing:
- تأخير 300ms قبل إرسال الطلب
- إلغاء الطلبات السابقة

### Caching:
- استخدام React Query (اختياري)
- Cache النتائج لمدة 5 دقائق

### Lazy Loading:
- تحميل النتائج عند الحاجة فقط
- Pagination في صفحة النتائج الكاملة

---

## 🎨 Styling

### Colors:
- **Primary:** `var(--color-primary)` (أخضر #0a5c0a)
- **Background:** `bg-white` (Light Mode فقط)
- **Border:** `border-gray-200`
- **Hover:** `hover:bg-gray-50`

### Icons:
- 🔍 Search icon (lucide-react)
- ⌘ Keyboard icon (Cmd/Ctrl)
- 👤 Deputy icon
- 📄 Complaint icon

---

## 📝 Translations (i18n)

### `messages/ar.json`:
```json
{
  "Search": {
    "placeholder": "ابحث عن نواب أو شكاوى...",
    "shortcut": "اضغط Ctrl+K",
    "noResults": "لا توجد نتائج",
    "deputies": "النواب",
    "complaints": "الشكاوى",
    "viewAll": "عرض جميع النتائج",
    "searching": "جاري البحث..."
  }
}
```

### `messages/en.json`:
```json
{
  "Search": {
    "placeholder": "Search for deputies or complaints...",
    "shortcut": "Press Ctrl+K",
    "noResults": "No results found",
    "deputies": "Deputies",
    "complaints": "Complaints",
    "viewAll": "View all results",
    "searching": "Searching..."
  }
}
```

---

## ✅ Success Criteria

- [ ] البحث يعمل بشكل صحيح للنواب والشكاوى
- [ ] Autocomplete يظهر النتائج بسرعة (< 500ms)
- [ ] Keyboard shortcuts تعمل (Ctrl+K, Escape, Arrows, Enter)
- [ ] Responsive على الموبايل
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] متناسق مع تصميم الموقع
- [ ] Performance جيد (debouncing, caching)

---

**آخر تحديث:** 1 نوفمبر 2025  
**الحالة:** 📝 جاهز للتنفيذ
