# 🗳️ تصميم نظام التصويت (Upvoting) للشكاوى

**التاريخ:** 1 نوفمبر 2025  
**المهمة:** Task 13 - إضافة نظام التصويت  
**الحالة:** 🔄 قيد التنفيذ

---

## 📋 المتطلبات

### الوظائف الأساسية:
1. ✅ السماح للمستخدمين بالتصويت على الشكاوى (Upvote)
2. ✅ عرض عداد التصويتات لكل شكوى
3. ✅ منع التصويت المتكرر من نفس المستخدم
4. ✅ ترتيب الشكاوى حسب عدد التصويتات
5. ✅ إمكانية إلغاء التصويت
6. ✅ تحديث العداد في الوقت الفعلي

---

## 🏗️ البنية المعمارية

### 1. Database Schema

#### جدول جديد: `complaint_votes`
```sql
CREATE TABLE complaint_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public_complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(complaint_id, user_id),
  UNIQUE(complaint_id, ip_address)
);

CREATE INDEX idx_complaint_votes_complaint_id ON complaint_votes(complaint_id);
CREATE INDEX idx_complaint_votes_user_id ON complaint_votes(user_id);
```

#### تحديث جدول `public_complaints`
```sql
ALTER TABLE public_complaints 
ADD COLUMN votes_count INTEGER DEFAULT 0;

CREATE INDEX idx_public_complaints_votes_count ON public_complaints(votes_count DESC);
```

**ملاحظات:**
- `user_id`: للمستخدمين المسجلين (nullable)
- `ip_address`: للمستخدمين غير المسجلين (fallback)
- `UNIQUE(complaint_id, user_id)`: منع التصويت المتكرر للمستخدمين المسجلين
- `UNIQUE(complaint_id, ip_address)`: منع التصويت المتكرر لنفس الـ IP

---

### 2. Server Actions

#### `src/app/actions/complaints/upvoteComplaint.ts`
```typescript
'use server';

export async function upvoteComplaint(complaintId: string) {
  // 1. Get user ID (if logged in) or IP address
  // 2. Check if already voted
  // 3. If not voted: insert vote + increment votes_count
  // 4. If already voted: delete vote + decrement votes_count (toggle)
  // 5. Return new votes_count
}
```

#### `src/app/actions/complaints/getComplaintVotes.ts`
```typescript
'use server';

export async function getComplaintVotes(complaintId: string) {
  // Return votes_count for a complaint
}
```

#### `src/app/actions/complaints/hasUserVoted.ts`
```typescript
'use server';

export async function hasUserVoted(complaintId: string) {
  // Check if current user/IP has voted
  // Return boolean
}
```

---

### 3. UI Components

#### `src/components/complaints/UpvoteButton.tsx`
```typescript
'use client';

interface UpvoteButtonProps {
  complaintId: string;
  initialVotesCount: number;
  initialHasVoted: boolean;
}

export function UpvoteButton({ complaintId, initialVotesCount, initialHasVoted }: UpvoteButtonProps) {
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async () => {
    // Toggle upvote
    // Update UI optimistically
    // Call server action
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={hasVoted ? 'active' : ''}
    >
      <ArrowUp />
      {votesCount}
    </button>
  );
}
```

---

## 🎨 UI/UX Design

### Desktop View:
```
┌─────────────────────────────────────────────────────────┐
│  ⬆️ 150    مشكلة في الطرق - مدينة نصر                  │
│           الطرق متهالكة وتحتاج صيانة عاجلة...          │
│           📍 القاهرة  •  🏷️ البنية التحتية             │
│           👤 محمد أحمد  •  📅 منذ 3 أيام                │
└─────────────────────────────────────────────────────────┘
```

### States:
1. **لم يصوت بعد:**
   - زر رمادي: `⬆️ 150`
   - عند hover: يتحول إلى أخضر فاتح

2. **صوّت:**
   - زر أخضر: `⬆️ 151` (مع background أخضر)
   - tooltip: "لقد أيدت هذه الشكوى"

3. **Loading:**
   - زر معطل مع spinner صغير

---

## 🔧 التنفيذ التقني

### Phase 1: Database Migration
```sql
-- File: supabase/migrations/20251101_add_upvoting_system.sql

-- Create complaint_votes table
CREATE TABLE IF NOT EXISTS complaint_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES public_complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_vote UNIQUE(complaint_id, user_id),
  CONSTRAINT unique_ip_vote UNIQUE(complaint_id, ip_address)
);

-- Add indexes
CREATE INDEX idx_complaint_votes_complaint_id ON complaint_votes(complaint_id);
CREATE INDEX idx_complaint_votes_user_id ON complaint_votes(user_id);
CREATE INDEX idx_complaint_votes_ip_address ON complaint_votes(ip_address);

-- Add votes_count column to public_complaints
ALTER TABLE public_complaints 
ADD COLUMN IF NOT EXISTS votes_count INTEGER DEFAULT 0;

-- Create index for sorting by votes
CREATE INDEX idx_public_complaints_votes_count ON public_complaints(votes_count DESC);

-- Update existing complaints to have votes_count = 0
UPDATE public_complaints SET votes_count = 0 WHERE votes_count IS NULL;

-- Create function to update votes_count automatically
CREATE OR REPLACE FUNCTION update_complaint_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public_complaints 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.complaint_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public_complaints 
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.complaint_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_complaint_votes_count
AFTER INSERT OR DELETE ON complaint_votes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_votes_count();
```

---

### Phase 2: Server Actions

#### Get Client IP Helper
```typescript
// src/lib/getClientIP.ts
import { headers } from 'next/headers';

export function getClientIP(): string {
  const headersList = headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
```

#### Upvote Action
```typescript
// src/app/actions/complaints/upvoteComplaint.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { getClientIP } from '@/lib/getClientIP';

export async function upvoteComplaint(complaintId: string) {
  const supabase = createClient();
  const ip = getClientIP();
  
  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if already voted
  const { data: existingVote } = await supabase
    .from('complaint_votes')
    .select('id')
    .eq('complaint_id', complaintId)
    .or(user ? `user_id.eq.${user.id}` : `ip_address.eq.${ip}`)
    .single();
  
  if (existingVote) {
    // Remove vote (toggle off)
    await supabase
      .from('complaint_votes')
      .delete()
      .eq('id', existingVote.id);
    
    return { success: true, hasVoted: false };
  } else {
    // Add vote
    await supabase
      .from('complaint_votes')
      .insert({
        complaint_id: complaintId,
        user_id: user?.id || null,
        ip_address: user ? null : ip,
      });
    
    return { success: true, hasVoted: true };
  }
}
```

---

### Phase 3: UI Components

#### UpvoteButton Component
```typescript
'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { upvoteComplaint } from '@/app/actions/complaints/upvoteComplaint';

interface UpvoteButtonProps {
  complaintId: string;
  initialVotesCount: number;
  initialHasVoted: boolean;
}

export function UpvoteButton({ 
  complaintId, 
  initialVotesCount, 
  initialHasVoted 
}: UpvoteButtonProps) {
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async () => {
    setIsLoading(true);
    
    // Optimistic update
    const newHasVoted = !hasVoted;
    const newVotesCount = newHasVoted ? votesCount + 1 : votesCount - 1;
    
    setHasVoted(newHasVoted);
    setVotesCount(newVotesCount);
    
    try {
      const result = await upvoteComplaint(complaintId);
      
      if (!result.success) {
        // Revert on error
        setHasVoted(!newHasVoted);
        setVotesCount(votesCount);
      }
    } catch (error) {
      // Revert on error
      setHasVoted(!newHasVoted);
      setVotesCount(votesCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg transition-all
        ${hasVoted 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={hasVoted ? 'إلغاء التأييد' : 'تأييد هذه الشكوى'}
      title={hasVoted ? 'إلغاء التأييد' : 'تأييد هذه الشكوى'}
    >
      <ArrowUp className="h-5 w-5" />
      <span className="text-sm font-semibold">{votesCount}</span>
    </button>
  );
}
```

---

## 📊 Sorting & Filtering

### Default Sort: بالتصويتات (Trending)
```typescript
const { data: complaints } = await supabase
  .from('public_complaints')
  .select('*')
  .order('votes_count', { ascending: false })
  .order('created_at', { ascending: false });
```

### Sort Options:
1. **الأكثر تصويتاً** (Most Upvoted) - Default
2. **الأحدث** (Newest)
3. **الأقدم** (Oldest)

---

## ♿ Accessibility

- ✅ `aria-label` للزر
- ✅ `title` tooltip
- ✅ Keyboard accessible (Enter/Space)
- ✅ Loading state واضح
- ✅ Color contrast مناسب

---

## 🧪 Testing Checklist

- [ ] تصويت على شكوى (مستخدم مسجل)
- [ ] تصويت على شكوى (مستخدم غير مسجل - IP)
- [ ] إلغاء التصويت (toggle)
- [ ] منع التصويت المتكرر
- [ ] تحديث العداد تلقائياً
- [ ] ترتيب الشكاوى حسب التصويتات
- [ ] Optimistic UI updates
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Accessibility

---

## 📈 Analytics (مستقبلاً)

- عدد التصويتات اليومية
- أكثر الشكاوى تصويتاً
- معدل التصويت لكل شكوى
- توزيع التصويتات حسب المحافظة

---

**آخر تحديث:** 1 نوفمبر 2025  
**الحالة:** 📝 جاهز للتنفيذ
