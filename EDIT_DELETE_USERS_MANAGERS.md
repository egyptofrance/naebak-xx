# Edit and Delete Functionality for Citizens and Managers

## Date: October 21, 2025

## Overview

Added comprehensive edit and delete functionality for both citizens (users) and managers in the admin panel.

---

## Features Added

### 1. Edit Citizen Data ✅

**Location**: `/app_admin/users`

**Features**:
- Edit button (pencil icon) in each user row
- Dialog to edit:
  - Full Name (الاسم الكامل)
  - Phone Number (رقم الهاتف)
- Arabic UI with RTL support for phone input
- Success/error messages in Arabic
- Auto-refresh after successful update

**Files Created**:
- `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/EditUserDialog.tsx`

**Server Action**:
- `updateUserProfileAction` in `src/data/admin/user.tsx`
- Updates `user_profiles` table
- Validates user ID (UUID)
- Supports nullable fields

---

### 2. Edit Manager Data ✅

**Location**: `/app_admin/managers`

**Features**:
- Edit button (pencil icon) in each manager row
- Dialog to edit:
  - Full Name (الاسم الكامل)
  - Phone Number (رقم الهاتف)
- Same UI/UX as citizen edit
- Arabic success/error messages
- Auto-refresh after successful update

**Files Created**:
- `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/EditManagerDialog.tsx`

**Server Action**:
- Uses same `updateUserProfileAction` (reusable)
- Updates `user_profiles` table

---

### 3. Delete Manager (Demote to Citizen) ✅

**Location**: `/app_admin/managers`

**Features**:
- Delete button (user minus icon) in each manager row
- Confirmation dialog with clear explanation
- Shows what will happen:
  - Remove manager role
  - Delete manager permissions
  - Add citizen role back
- Arabic UI with detailed description
- Success message shows manager name
- Auto-refresh after successful demotion

**Files Created**:
- `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/DemoteManagerButton.tsx`

**Server Action**:
- `demoteManagerAction` in `src/data/admin/managers.ts`
- Uses service role client for full access
- Transaction-like behavior:
  1. Verify user exists
  2. Verify user is a manager
  3. Delete manager permissions
  4. Remove manager role
  5. Add citizen role back
- Detailed console logging for debugging
- Proper error handling with Arabic messages

---

## Database Operations

### Update User Profile

**Table**: `user_profiles`

**Fields Updated**:
- `full_name` - Full name of the user
- `phone` - Phone number

**SQL Operation**:
```sql
UPDATE user_profiles
SET 
  full_name = $1,
  phone = $2
WHERE id = $3;
```

---

### Demote Manager to Citizen

**Tables Affected**:
1. `manager_permissions` - DELETE
2. `user_roles` - DELETE (manager) + INSERT (citizen)

**Operations**:

**Step 1**: Delete manager permissions
```sql
DELETE FROM manager_permissions
WHERE user_id = $1;
```

**Step 2**: Remove manager role
```sql
DELETE FROM user_roles
WHERE user_id = $1 AND role = 'manager';
```

**Step 3**: Add citizen role
```sql
INSERT INTO user_roles (user_id, role)
VALUES ($1, 'citizen');
```

---

## UI Components

### EditUserDialog / EditManagerDialog

**Structure**:
```tsx
<Dialog>
  <DialogTrigger>
    <Button variant="ghost" size="sm">
      <Edit className="w-4 h-4" />
    </Button>
  </DialogTrigger>
  <DialogContent>
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Label>الاسم الكامل</Label>
        <Input value={fullName} onChange={...} />
        
        <Label>رقم الهاتف</Label>
        <Input value={phone} onChange={...} dir="ltr" />
      </div>
      <DialogFooter>
        <Button variant="outline">إلغاء</Button>
        <Button type="submit">حفظ التغييرات</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**Features**:
- Controlled inputs with React state
- Form submission handling
- Loading states during API calls
- Toast notifications for success/error
- Auto-close on success
- Page refresh to show updated data

---

### DemoteManagerButton

**Structure**:
```tsx
<Dialog>
  <DialogTrigger>
    <Button variant="ghost" size="sm">
      <UserMinus className="w-4 h-4 text-destructive" />
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <UserMinus icon in destructive color />
      <DialogTitle>إزالة المدير</DialogTitle>
      <DialogDescription>
        هل أنت متأكد من إزالة {managerName}؟
        
        سيتم:
        - إزالة دور المدير
        - حذف صلاحيات المدير
        - إعادته إلى قائمة المواطنين
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">إلغاء</Button>
      <Button variant="destructive">إزالة المدير</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Features**:
- Clear warning with icon
- Detailed explanation of consequences
- Destructive styling for delete action
- Confirmation required
- Loading state during operation
- Success message with manager name

---

## Updated Table Columns

### Citizens List (`/app_admin/users`)

**Before**:
| Full Name | Email | Created At | Contact | Send Login | Get Login | Promote Deputy | Promote Manager | Delete |

**After**:
| Full Name | Email | Created At | Contact | Send Login | Get Login | Promote Deputy | Promote Manager | **Edit** | Delete |

---

### Managers List (`/app_admin/managers`)

**Before**:
| الاسم الكامل | البريد الإلكتروني | مدير | تاريخ الإنشاء | التواصل |

**After**:
| الاسم الكامل | البريد الإلكتروني | مدير | تاريخ الإنشاء | التواصل | **تعديل** | **إزالة** |

---

## User Flows

### Edit Citizen Flow

1. Admin opens `/app_admin/users`
2. Admin clicks Edit button (pencil icon) for a user
3. Dialog opens with current name and phone
4. Admin edits the fields
5. Admin clicks "حفظ التغييرات"
6. Loading state shows "جاري الحفظ..."
7. Success toast: "تم تحديث بيانات المستخدم بنجاح!"
8. Dialog closes
9. Page refreshes to show updated data

---

### Edit Manager Flow

1. Admin opens `/app_admin/managers`
2. Admin clicks Edit button (pencil icon) for a manager
3. Dialog opens with current name and phone
4. Admin edits the fields
5. Admin clicks "حفظ التغييرات"
6. Loading state shows "جاري الحفظ..."
7. Success toast: "تم تحديث بيانات المدير بنجاح!"
8. Dialog closes
9. Page refreshes to show updated data

---

### Demote Manager Flow

1. Admin opens `/app_admin/managers`
2. Admin clicks Delete button (user minus icon) for a manager
3. Confirmation dialog opens with:
   - Warning icon
   - Manager name
   - List of consequences
4. Admin clicks "إزالة المدير"
5. Loading state shows "جاري الإزالة..."
6. System performs:
   - Delete manager permissions
   - Remove manager role
   - Add citizen role
7. Success toast: "تم إزالة {name} من قائمة المديرين وإعادته إلى قائمة المواطنين"
8. Dialog closes
9. Page refreshes
10. Manager disappears from managers list
11. Manager appears in citizens list at `/app_admin/users`

---

## Error Handling

### Edit User/Manager

**Possible Errors**:
- Invalid user ID
- User not found
- Database connection error
- Permission denied

**Error Messages** (Arabic):
- "فشل تحديث البيانات" - Generic error
- Custom error from server if available

---

### Demote Manager

**Possible Errors**:
- "المستخدم غير موجود" - User not found
- "المستخدم ليس مديراً" - User is not a manager
- "فشل إزالة دور المدير" - Failed to remove manager role
- Database errors

**Error Handling**:
- Detailed console logging for debugging
- Arabic error messages for users
- Toast notifications for all errors
- Dialog stays open on error

---

## Type Safety

### User Type (Citizens List)

```typescript
type User = {
  id: string;
  full_name: string | null;
  phone: string | null;  // ← Added
  created_at: string;
  user_application_settings?: {
    email_readonly: string;
  } | null;
};
```

### Manager Type (Managers List)

```typescript
// Uses user_profiles type from database
{
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  // ... other fields
}
```

---

## Validation

### Update User Profile Action

```typescript
const updateUserProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
});
```

**Rules**:
- User ID must be valid UUID
- Full name can be null or string
- Phone can be null or string
- Empty strings are converted to null

---

### Demote Manager Action

```typescript
const demoteManagerSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});
```

**Rules**:
- User ID must be valid UUID
- Additional validation in action:
  - User must exist
  - User must have manager role

---

## Testing Checklist

### Edit Citizen

- [ ] Edit button appears in citizens list
- [ ] Click edit opens dialog with current data
- [ ] Can edit full name
- [ ] Can edit phone number
- [ ] Can clear fields (set to null)
- [ ] Cancel button closes dialog without saving
- [ ] Save button updates data
- [ ] Success toast appears
- [ ] Page refreshes with updated data
- [ ] Error handling works (invalid data, network error)

---

### Edit Manager

- [ ] Edit button appears in managers list
- [ ] Click edit opens dialog with current data
- [ ] Can edit full name
- [ ] Can edit phone number
- [ ] Can clear fields (set to null)
- [ ] Cancel button closes dialog without saving
- [ ] Save button updates data
- [ ] Success toast appears
- [ ] Page refreshes with updated data
- [ ] Error handling works

---

### Demote Manager

- [ ] Delete button appears in managers list
- [ ] Click delete opens confirmation dialog
- [ ] Dialog shows manager name
- [ ] Dialog lists consequences clearly
- [ ] Cancel button closes dialog without action
- [ ] Delete button starts demotion
- [ ] Loading state shows during operation
- [ ] Success toast shows with manager name
- [ ] Manager disappears from managers list
- [ ] Manager appears in citizens list
- [ ] Manager permissions are deleted
- [ ] Manager role is removed
- [ ] Citizen role is added
- [ ] Cannot demote non-manager user
- [ ] Error handling works

---

## Git Commit

**Commit Hash**: `ca05bc4`

**Commit Message**:
```
feat: Add edit and delete functionality for citizens and managers

Citizens (Users):
- Added EditUserDialog component to edit citizen name and phone
- Added Edit button column in users list
- Added updateUserProfileAction to update user profile data

Managers:
- Added EditManagerDialog component to edit manager name and phone
- Added DemoteManagerButton component to remove manager role
- Added demoteManagerAction to demote manager back to citizen
- Added Edit and Delete button columns in managers list
- Demoting manager removes manager role, deletes permissions, and adds citizen role back

All changes:
- Edit dialogs support full name and phone number editing
- Demote manager includes confirmation dialog with clear explanation
- All actions show Arabic success/error messages
- Pages refresh automatically after successful operations
- Consistent UI/UX across citizens and managers management
```

**Pushed to**: `main` branch on GitHub

---

## Files Modified/Created

### New Files (3)
1. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/EditUserDialog.tsx`
2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/EditManagerDialog.tsx`
3. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/DemoteManagerButton.tsx`

### Modified Files (4)
1. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/UsersListWithBulkDelete.tsx`
2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/ManagersList.tsx`
3. `src/data/admin/user.tsx`
4. `src/data/admin/managers.ts`

---

## Related Features

### Existing Features
- ✅ Promote citizen to deputy
- ✅ Promote citizen to manager
- ✅ Delete citizen (permanent)
- ✅ View managers list
- ✅ View citizens list

### New Features
- ✅ Edit citizen data
- ✅ Edit manager data
- ✅ Demote manager to citizen

### Future Enhancements

1. **Edit Manager Permissions**
   - Create page to edit individual permissions
   - Checkboxes for each permission type
   - Save/cancel functionality

2. **Bulk Operations**
   - Select multiple managers to demote
   - Bulk edit (change multiple users at once)

3. **Audit Log**
   - Track who edited what and when
   - Show history of role changes
   - Display in user/manager detail page

4. **Advanced Validation**
   - Phone number format validation
   - Name length constraints
   - Duplicate phone number check

5. **Export Functionality**
   - Export managers list to CSV
   - Export citizens list to CSV
   - Include all fields

---

## Status

✅ **COMPLETED** - Edit and delete functionality for citizens and managers implemented successfully.

---

## Deployment

- Pushed to GitHub: ✅
- Vercel deployment: Automatic (triggered by push)
- Ready for testing: ✅

---

## Support

For questions or issues:
- Check this documentation
- Review commit `ca05bc4`
- Compare with previous commits for context
- Test in production after Vercel deployment completes

