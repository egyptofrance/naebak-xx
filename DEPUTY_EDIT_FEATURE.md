# Deputy Edit Feature Documentation

## Date: October 21, 2025

## Overview

Added comprehensive edit functionality for deputies in the admin panel, allowing admins to update all electoral and profile information inline without navigation.

---

## Features Added

### 1. Edit Deputy Dialog ✅

**Location**: `/app_admin/deputies`

**Fields Available for Editing**:

1. **الحالة (Deputy Status)** *
   - نائب حالي (current)
   - مرشح للعضوية (candidate)
   - نائب سابق (former)
   - Required field with dropdown selection

2. **المجلس (Council)**
   - Dropdown with all available councils
   - Option to select "بدون مجلس" (no council)
   - Fetched from `councils` table

3. **الرمز الانتخابي (Electoral Symbol)**
   - Text input
   - Examples: الأسد، النخلة، الهلال
   - Optional field

4. **الرقم الانتخابي (Electoral Number)**
   - Text input with LTR direction
   - Example: 123
   - Optional field

5. **البرنامج الانتخابي (Electoral Program)**
   - Textarea with 4 rows
   - For detailed electoral platform
   - Optional field

6. **الإنجازات (Achievements)**
   - Textarea with 4 rows
   - For listing deputy's accomplishments
   - Optional field

7. **المناسبات (Events)**
   - Textarea with 4 rows
   - For listing events and activities
   - Optional field

---

## Technical Implementation

### Server Action Updates

**File**: `src/data/admin/deputies.ts`

**Schema Updates**:
```typescript
const updateDeputySchema = z.object({
  deputyId: z.string().uuid("Invalid deputy ID"),
  deputyStatus: z.enum(["current", "candidate", "former"]).optional(),
  bio: z.string().optional(),
  officeAddress: z.string().optional(),
  officePhone: z.string().optional(),
  officeHours: z.string().optional(),
  electoralSymbol: z.string().optional(),
  electoralNumber: z.string().optional(),
  electoralProgram: z.string().optional(),
  achievements: z.string().optional(),
  events: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  socialMediaFacebook: z.string().url().optional().or(z.literal("")),
  socialMediaTwitter: z.string().url().optional().or(z.literal("")),
  socialMediaInstagram: z.string().url().optional().or(z.literal("")),
  socialMediaYoutube: z.string().url().optional().or(z.literal("")),
  councilId: z.string().uuid().optional().nullable(),
});
```

**Field Mapping** (camelCase → snake_case):
```typescript
const dbUpdateData: any = {};
if (updateData.deputyStatus !== undefined) dbUpdateData.deputy_status = updateData.deputyStatus;
if (updateData.electoralSymbol !== undefined) dbUpdateData.electoral_symbol = updateData.electoralSymbol;
if (updateData.electoralNumber !== undefined) dbUpdateData.electoral_number = updateData.electoralNumber;
if (updateData.electoralProgram !== undefined) dbUpdateData.electoral_program = updateData.electoralProgram;
if (updateData.achievements !== undefined) dbUpdateData.achievements = updateData.achievements;
if (updateData.events !== undefined) dbUpdateData.events = updateData.events;
if (updateData.councilId !== undefined) dbUpdateData.council_id = updateData.councilId;
// ... other fields
```

**Database Operation**:
```typescript
const { data: deputy, error } = await supabase
  .from("deputy_profiles")
  .update(dbUpdateData)
  .eq("id", deputyId)
  .select()
  .single();
```

---

### UI Component

**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/EditDeputyDialog.tsx`

**Component Structure**:
```tsx
<Dialog>
  <DialogTrigger>
    <Button variant="ghost" size="sm">
      <Edit className="w-4 h-4" />
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>تعديل بيانات النائب</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Deputy Status Dropdown */}
        <Select value={deputyStatus} onValueChange={setDeputyStatus}>
          <SelectItem value="current">نائب حالي</SelectItem>
          <SelectItem value="candidate">مرشح للعضوية</SelectItem>
          <SelectItem value="former">نائب سابق</SelectItem>
        </Select>
        
        {/* Council Dropdown */}
        <Select value={councilId} onValueChange={setCouncilId}>
          <SelectItem value="">بدون مجلس</SelectItem>
          {councils.map(council => (
            <SelectItem value={council.id}>{council.name_ar}</SelectItem>
          ))}
        </Select>
        
        {/* Electoral Symbol Input */}
        <Input value={electoralSymbol} onChange={...} />
        
        {/* Electoral Number Input */}
        <Input value={electoralNumber} onChange={...} dir="ltr" />
        
        {/* Electoral Program Textarea */}
        <Textarea value={electoralProgram} onChange={...} rows={4} />
        
        {/* Achievements Textarea */}
        <Textarea value={achievements} onChange={...} rows={4} />
        
        {/* Events Textarea */}
        <Textarea value={events} onChange={...} rows={4} />
      </div>
      
      <DialogFooter>
        <Button variant="outline">إلغاء</Button>
        <Button type="submit">حفظ التغييرات</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**State Management**:
```typescript
const [deputyStatus, setDeputyStatus] = useState(currentData.deputyStatus);
const [electoralProgram, setElectoralProgram] = useState(currentData.electoralProgram || "");
const [achievements, setAchievements] = useState(currentData.achievements || "");
const [events, setEvents] = useState(currentData.events || "");
const [councilId, setCouncilId] = useState(currentData.councilId || "");
const [electoralSymbol, setElectoralSymbol] = useState(currentData.electoralSymbol || "");
const [electoralNumber, setElectoralNumber] = useState(currentData.electoralNumber || "");
```

**Form Reset on Open**:
```typescript
useEffect(() => {
  if (open) {
    // Reset all fields to current data
    setDeputyStatus(currentData.deputyStatus);
    setElectoralProgram(currentData.electoralProgram || "");
    // ... reset other fields
  }
}, [open, currentData]);
```

---

### Deputies List Integration

**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/DeputiesList.tsx`

**Before**:
```tsx
<TableCell>
  <Link href={`/app_admin/deputies/${deputy.id}`}>
    <Button size="sm" variant="outline">
      <Edit className="h-4 w-4 mr-2" />
      تعديل
    </Button>
  </Link>
</TableCell>
```

**After**:
```tsx
<TableCell>
  <EditDeputyDialog
    deputyId={deputy.id}
    currentData={{
      deputyStatus: deputy.deputy_status,
      electoralProgram: deputy.electoral_program,
      achievements: deputy.achievements,
      events: deputy.events,
      councilId: deputy.council_id,
      electoralSymbol: deputy.electoral_symbol,
      electoralNumber: deputy.electoral_number,
    }}
    councils={councils}
  />
</TableCell>
```

**Deputy Interface Update**:
```typescript
interface Deputy {
  id: string;
  user_id: string;
  deputy_status: "current" | "candidate";
  electoral_symbol: string | null;
  electoral_number: string | null;
  electoral_program: string | null;  // ← Added
  achievements: string | null;       // ← Added
  events: string | null;             // ← Added
  created_at: string;
  council_id: string | null;
  // ... other fields
}
```

---

## Database Schema

**Table**: `deputy_profiles`

**Columns Updated**:
| Column | Type | Description |
|--------|------|-------------|
| `deputy_status` | TEXT | Current status: current/candidate/former |
| `council_id` | UUID | Foreign key to councils table |
| `electoral_symbol` | TEXT | Electoral symbol (e.g., lion, palm tree) |
| `electoral_number` | TEXT | Electoral number |
| `electoral_program` | TEXT | Detailed electoral platform |
| `achievements` | TEXT | List of accomplishments |
| `events` | TEXT | Events and activities |

---

## User Flow

### Edit Deputy Data

1. Admin opens `/app_admin/deputies`
2. Admin sees list of all deputies
3. Admin clicks Edit icon (pencil) for a deputy
4. Dialog opens with current data pre-filled
5. Admin modifies any fields:
   - Changes deputy status (dropdown)
   - Selects council (dropdown)
   - Updates electoral symbol
   - Updates electoral number
   - Edits electoral program
   - Edits achievements
   - Edits events
6. Admin clicks "حفظ التغييرات"
7. Loading state shows "جاري الحفظ..."
8. Success toast: "تم تحديث بيانات النائب بنجاح!"
9. Dialog closes
10. Page refreshes to show updated data

---

## Validation

### Required Fields
- ✅ Deputy Status (must select one of: current, candidate, former)

### Optional Fields
- ✅ Council (can be empty)
- ✅ Electoral Symbol
- ✅ Electoral Number
- ✅ Electoral Program
- ✅ Achievements
- ✅ Events

### Field Constraints
- Deputy Status: Must be one of the enum values
- Council ID: Must be valid UUID or null
- All text fields: No length constraints (database TEXT type)

---

## Error Handling

### Possible Errors
- Invalid deputy ID
- Deputy not found
- Database connection error
- Permission denied

### Error Messages (Arabic)
- "فشل تحديث البيانات" - Generic error
- Custom error from server if available

### Error Display
- Toast notification with error message
- Dialog stays open on error
- User can retry or cancel

---

## Features

### Form Behavior
- ✅ Pre-fills with current data
- ✅ Resets when dialog opens
- ✅ Validates on submit
- ✅ Shows loading state during save
- ✅ Closes on successful save
- ✅ Stays open on error

### UI/UX
- ✅ Scrollable dialog for long forms
- ✅ Max width 700px
- ✅ Max height 90vh with overflow scroll
- ✅ Proper spacing between fields
- ✅ Clear labels in Arabic
- ✅ Placeholder text for guidance
- ✅ RTL support for Arabic text
- ✅ LTR for electoral number

### Data Handling
- ✅ Proper camelCase to snake_case mapping
- ✅ Undefined fields not sent to database
- ✅ Empty strings converted to undefined
- ✅ Null values handled correctly
- ✅ Service role client for permissions

---

## Testing Checklist

### Dialog Functionality
- [ ] Edit button appears in deputies list
- [ ] Click edit opens dialog
- [ ] Dialog shows current data
- [ ] Can change deputy status
- [ ] Can select council
- [ ] Can clear council selection
- [ ] Can edit electoral symbol
- [ ] Can edit electoral number
- [ ] Can edit electoral program
- [ ] Can edit achievements
- [ ] Can edit events
- [ ] Cancel button closes dialog without saving
- [ ] Save button updates data
- [ ] Success toast appears
- [ ] Dialog closes on success
- [ ] Page refreshes with updated data

### Data Validation
- [ ] Deputy status is required
- [ ] All other fields are optional
- [ ] Empty fields don't cause errors
- [ ] Long text in textareas works
- [ ] Council selection updates correctly
- [ ] Electoral number accepts any text

### Error Handling
- [ ] Invalid deputy ID shows error
- [ ] Network error shows error message
- [ ] Error toast appears
- [ ] Dialog stays open on error
- [ ] Can retry after error

### UI/UX
- [ ] Dialog is scrollable
- [ ] Form fits in viewport
- [ ] Labels are clear
- [ ] Placeholders are helpful
- [ ] Loading state shows during save
- [ ] Buttons are disabled during save
- [ ] RTL text direction works
- [ ] LTR for electoral number works

---

## Git Commit

**Commit Hash**: `0a08473`

**Commit Message**:
```
feat: Add comprehensive deputy edit functionality

Deputy Edit Dialog:
- Added EditDeputyDialog component with all required fields
- Deputy Status (current/candidate/former) dropdown
- Council selection dropdown
- Electoral Symbol input
- Electoral Number input
- Electoral Program textarea
- Achievements textarea
- Events textarea

Server Action Updates:
- Updated updateDeputyAction to include deputyStatus field
- Added proper camelCase to snake_case field mapping
- All fields properly mapped to database columns
- Arabic success messages

Deputies List Updates:
- Replaced link-based edit button with EditDeputyDialog
- Added missing fields to Deputy interface
- Dialog opens inline without navigation
- Auto-refresh after successful update

Features:
- Form validation with Zod schema
- Loading states during save
- Toast notifications for success/error
- Form resets when dialog opens
- All fields optional except deputy status
- Councils fetched from database
```

**Pushed to**: `main` branch on GitHub

---

## Files Modified/Created

### New Files (1)
1. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/EditDeputyDialog.tsx`

### Modified Files (2)
1. `src/data/admin/deputies.ts`
2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/DeputiesList.tsx`

---

## Related Features

### Existing Features
- ✅ View deputies list
- ✅ Search deputies
- ✅ Filter deputies by governorate/party/council/status
- ✅ Promote citizen to deputy
- ✅ View deputy profile

### New Features
- ✅ Edit deputy status
- ✅ Edit deputy council
- ✅ Edit electoral information
- ✅ Edit electoral program
- ✅ Edit achievements
- ✅ Edit events

### Future Enhancements

1. **Bulk Edit**
   - Select multiple deputies
   - Update common fields at once
   - Useful for changing council or status

2. **Rich Text Editor**
   - Use rich text editor for electoral program
   - Use rich text editor for achievements
   - Use rich text editor for events
   - Support formatting, lists, links

3. **Image Upload**
   - Upload electoral symbol image
   - Upload achievement photos
   - Upload event photos

4. **Audit Log**
   - Track who edited what and when
   - Show edit history
   - Display in deputy detail page

5. **Validation Enhancements**
   - Electoral number format validation
   - Electoral symbol character limit
   - Required fields based on status
   - Duplicate electoral number check

6. **Export Functionality**
   - Export deputies with all fields to CSV
   - Include electoral information
   - Include achievements and events

---

## Status

✅ **COMPLETED** - Deputy edit functionality implemented successfully with all requested fields.

---

## Deployment

- Pushed to GitHub: ✅
- Vercel deployment: Automatic (triggered by push)
- Ready for testing: ✅

---

## Notes

- All fields except deputy status are optional
- Empty strings are converted to undefined before saving
- Councils are fetched from the database dynamically
- Dialog is scrollable for better UX on smaller screens
- Form resets automatically when dialog opens
- Page refreshes after successful update to show changes

---

## Support

For questions or issues:
- Check this documentation
- Review commit `0a08473`
- Test in production after Vercel deployment completes
- Verify all fields save correctly
- Check that councils dropdown populates

