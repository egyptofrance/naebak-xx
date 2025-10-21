# Councils Management System - Documentation

## Date: October 21, 2025

## Overview
Complete councils management system added to the admin panel, providing full CRUD operations for managing legislative councils (مجلس النواب، مجلس الشيوخ، etc.) in the naebak-xx application.

---

## Features Implemented

### 1. Server Actions (Backend) ✅
**File**: `src/data/admin/council.tsx`

**Available Actions**:
- `getCouncilsAction()` - Fetch all councils ordered by display_order
- `createCouncilAction()` - Create a new council with validation
- `updateCouncilAction()` - Update council information
- `deleteCouncilAction()` - Delete a council
- `toggleCouncilActiveAction()` - Toggle active/inactive status
- `updateCouncilOrderAction()` - Update display order
- `reorderAllCouncilsAction()` - Reorder all councils alphabetically

**Validation Features**:
- ✅ Prevents duplicate council names (Arabic)
- ✅ Prevents duplicate council codes
- ✅ Automatic display_order assignment for new councils
- ✅ Error messages in Arabic for better UX

### 2. User Interface (Frontend) ✅

#### Main Page
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/page.tsx`

**Features**:
- Page title and description
- "Add New Council" button
- "Reorder All" button
- Councils list display

#### Councils List
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/CouncilsList.tsx`

**Features**:
- Table view with columns:
  - Display Order
  - Arabic Name
  - English Name
  - Code (displayed as code block)
  - Active Status (toggle button)
  - Actions (Move Up, Move Down, Edit, Delete)
- Real-time order updates
- Confirmation dialog for deletion
- Toast notifications for all operations

#### Create Council Dialog
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/CreateCouncilDialog.tsx`

**Form Fields**:
- Arabic Name * (required)
- English Name * (required)
- Code * (required)
- Arabic Description (optional)
- English Description (optional)

**Features**:
- Form validation
- Loading states
- Success/error toast notifications
- Auto-refresh after creation

#### Edit Council Dialog
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/EditCouncilDialog.tsx`

**Features**:
- Pre-filled form with current council data
- Same fields as create dialog
- Validation for duplicate names/codes
- Success/error handling

#### Reorder Button
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/ReorderCouncilsButton.tsx`

**Features**:
- Reorders all councils alphabetically by Arabic name
- Loading state during operation
- Toast notifications

### 3. Admin Sidebar Integration ✅
**File**: `src/components/sidebar-admin-panel-nav.tsx`

**Changes**:
- Added "إدارة المجالس" (Councils Management) link
- Uses `Building2` icon from lucide-react
- Positioned after "إدارة الأحزاب" (Parties Management)

### 4. TypeScript Types ✅
**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/types.ts`

**Council Interface**:
```typescript
interface Council {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}
```

---

## Database Structure

### Councils Table
The `councils` table already exists in Supabase with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name_ar` | TEXT | Council name in Arabic |
| `name_en` | TEXT | Council name in English |
| `code` | TEXT | Unique code (e.g., "parliament", "senate") |
| `description_ar` | TEXT | Optional description in Arabic |
| `description_en` | TEXT | Optional description in English |
| `is_active` | BOOLEAN | Active status |
| `display_order` | INTEGER | Display order |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

## How It Works

### Centralized Data Management

All council data is stored in the `councils` table in Supabase. Every operation (create, update, delete, reorder) directly modifies the database, ensuring data consistency across the entire application.

### Data Flow

1. **User Action** → UI Component (Dialog/Button)
2. **Component** → Server Action (via next-safe-action)
3. **Server Action** → Supabase Database
4. **Database** → Returns result
5. **Component** → Shows toast notification
6. **Page** → Refreshes to show updated data

### Validation Flow

#### Creating a Council:
1. Check if Arabic name already exists → Error if duplicate
2. Check if code already exists → Error if duplicate
3. Get highest display_order → Assign (max + 1) to new council
4. Insert into database
5. Return success

#### Updating a Council:
1. Check if another council has same Arabic name → Error if duplicate
2. Check if another council has same code → Error if duplicate
3. Update council in database
4. Return success

---

## Usage Examples

### Example 1: Current Egyptian Councils

**مجلس النواب (House of Representatives)**
- Arabic Name: مجلس النواب
- English Name: House of Representatives
- Code: parliament
- Display Order: 0

**مجلس الشيوخ (Senate)**
- Arabic Name: مجلس الشيوخ
- English Name: Senate
- Code: senate
- Display Order: 1

### Example 2: Adding a New Council

1. Click "إضافة مجلس جديد" button
2. Fill in the form:
   - Arabic Name: مجلس المحليات
   - English Name: Local Councils
   - Code: local_councils
   - Description (optional)
3. Click "إضافة"
4. Council is created with display_order = 2 (automatically)
5. Page refreshes to show the new council

### Example 3: Reordering Councils

**Before Reorder** (manual ordering):
- 0: مجلس النواب
- 1: مجلس الشيوخ
- 2: مجلس المحليات

**After "إعادة ترتيب الكل"** (alphabetical):
- 0: مجلس الشيوخ
- 1: مجلس المحليات
- 2: مجلس النواب

---

## Integration Points

### Where Councils Are Used

1. **Deputies Management** (`/app_admin/deputies`)
   - Filter deputies by council
   - Assign council to deputy

2. **Deputy Profile** (`/app_admin/deputies/[deputyId]`)
   - Display deputy's council
   - Edit deputy's council

3. **User Profiles** (Future)
   - Users may select their electoral council
   - Filter users by council

---

## API Reference

### getCouncilsAction()
```typescript
const result = await getCouncilsAction();
// Returns: { councils: Council[] }
```

### createCouncilAction(data)
```typescript
const result = await createCouncilAction({
  name_ar: "مجلس النواب",
  name_en: "House of Representatives",
  code: "parliament",
  description_ar: "وصف المجلس",
  description_en: "Council description"
});
// Returns: { council: Council, message: string }
```

### updateCouncilAction(data)
```typescript
const result = await updateCouncilAction({
  id: "council-uuid",
  name_ar: "مجلس النواب المصري",
  name_en: "Egyptian House of Representatives",
  code: "parliament",
  description_ar: "وصف محدث",
  description_en: "Updated description"
});
// Returns: { council: Council, message: string }
```

### deleteCouncilAction(data)
```typescript
const result = await deleteCouncilAction({
  id: "council-uuid"
});
// Returns: { message: string }
```

### toggleCouncilActiveAction(data)
```typescript
const result = await toggleCouncilActiveAction({
  id: "council-uuid",
  isActive: true
});
// Returns: { message: string }
```

### updateCouncilOrderAction(data)
```typescript
const result = await updateCouncilOrderAction({
  id: "council-uuid",
  newOrder: 5
});
// Returns: { message: string }
```

### reorderAllCouncilsAction()
```typescript
const result = await reorderAllCouncilsAction({});
// Returns: { message: string }
```

---

## Files Created/Modified

### New Files (8 files)
1. `src/data/admin/council.tsx` - Server actions
2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/page.tsx` - Main page
3. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/types.ts` - TypeScript types
4. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/CouncilsList.tsx` - List component
5. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/CreateCouncilDialog.tsx` - Create dialog
6. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/EditCouncilDialog.tsx` - Edit dialog
7. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/councils/ReorderCouncilsButton.tsx` - Reorder button
8. `COUNCILS_MANAGEMENT_SYSTEM.md` - This documentation

### Modified Files (1 file)
1. `src/components/sidebar-admin-panel-nav.tsx` - Added councils link

---

## Testing Checklist

After deployment, verify:

- [ ] Admin sidebar shows "إدارة المجالس" link
- [ ] Councils page loads correctly at `/app_admin/councils`
- [ ] Existing councils are displayed in the table
- [ ] Can create a new council with all fields
- [ ] Cannot create council with duplicate name (shows error)
- [ ] Cannot create council with duplicate code (shows error)
- [ ] Can edit council information
- [ ] Cannot edit to duplicate name/code (shows error)
- [ ] Can toggle active/inactive status
- [ ] Can move councils up/down in order
- [ ] Can delete a council (with confirmation)
- [ ] "Reorder All" button works correctly
- [ ] All toast notifications appear correctly
- [ ] Page refreshes after operations to show updates

---

## Future Enhancements

### Recommended Improvements

1. **Database Constraints**
   - Add unique constraint on `name_ar` column
   - Add unique constraint on `code` column
   - Add check constraint for `display_order >= 0`

```sql
ALTER TABLE councils ADD CONSTRAINT unique_council_name_ar UNIQUE (name_ar);
ALTER TABLE councils ADD CONSTRAINT unique_council_code UNIQUE (code);
ALTER TABLE councils ADD CONSTRAINT check_display_order CHECK (display_order >= 0);
```

2. **Soft Delete**
   - Add `deleted_at` column for soft deletes
   - Prevent deletion if council has associated deputies
   - Show warning before deleting council with deputies

3. **Audit Log**
   - Track who created/updated/deleted councils
   - Show history of changes

4. **Bulk Operations**
   - Import councils from CSV
   - Export councils to CSV
   - Bulk activate/deactivate

5. **Search & Filter**
   - Search councils by name
   - Filter by active/inactive status
   - Sort by different columns

---

## Comparison with Parties Management

The councils management system follows the exact same structure as the parties management system for consistency:

| Feature | Parties | Councils |
|---------|---------|----------|
| CRUD Operations | ✅ | ✅ |
| Duplicate Validation | ✅ | ✅ |
| Display Order | ✅ | ✅ |
| Active/Inactive Toggle | ✅ | ✅ |
| Move Up/Down | ✅ | ✅ |
| Reorder All | ✅ | ✅ |
| Admin Sidebar Link | ✅ | ✅ |
| Toast Notifications | ✅ | ✅ |
| Centralized Data | ✅ | ✅ |

**Additional in Councils**:
- Code field (unique identifier)
- Description fields (Arabic & English)

---

## Git Commit

**Commit Hash**: `9958bc5`

**Commit Message**:
```
feat: Add complete councils management system to admin panel

- Created council.tsx server actions with full CRUD operations
- Added validation to prevent duplicate council names and codes
- Created councils management page with list, create, edit, and delete functionality
- Added council ordering (move up/down) and reorder all feature
- Added toggle active/inactive status for councils
- Created CouncilsList, CreateCouncilDialog, EditCouncilDialog components
- Added ReorderCouncilsButton for bulk reordering
- Added councils section to admin sidebar with Building2 icon
- Includes description fields (Arabic and English) for councils
- All operations are centralized and reflect immediately in database
- Similar structure to parties management for consistency
```

**Pushed to**: `main` branch on GitHub
**Deployment**: Automatic deployment to Vercel triggered

---

## Status

✅ **COMPLETED** - Full councils management system implemented and deployed successfully.

---

## Support

For questions or issues:
- Refer to this documentation
- Check `src/data/admin/council.tsx` for server action implementations
- Check parties management system for similar patterns
- Git commit `9958bc5` for full change history

