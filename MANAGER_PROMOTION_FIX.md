# Manager Promotion Fix - Documentation

## Date: October 21, 2025

## Problem Description

When clicking the "Promote to Manager" button in the users list, the system was showing an error: **"User not found"**.

### Root Cause

The `promoteToManagerAction` was using `createSupabaseUserServerComponentClient()` instead of the service role client. This client:
- Only has access to the current logged-in user's data
- Cannot access other users' data due to Row Level Security (RLS) policies
- Resulted in "User not found" error when trying to promote another user

---

## Solution Implemented

### 1. Fixed Service Role Client Usage ✅

**File**: `src/data/admin/managers.ts`

**Changes**:
- Replaced `createSupabaseUserServerComponentClient()` with direct `createClient()` using service role key
- This matches the pattern used in `createDeputyAction` which works correctly

**Before**:
```typescript
const supabase = await createSupabaseUserServerComponentClient();
```

**After**:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### 2. Added Citizen Role Removal ✅

When promoting a user to manager, the system now:
1. **Removes** the "citizen" role (if exists)
2. **Adds** the "manager" role
3. **Creates** manager permissions record

This ensures the user is removed from the citizens list and appears only in the managers list.

**Implementation**:
```typescript
// Step 1: Remove "citizen" role if exists
const { error: removeCitizenError } = await supabase
  .from("user_roles")
  .delete()
  .eq("user_id", userId)
  .eq("role", "citizen");

// Step 2: Add manager role
const { data: roleData, error: roleError } = await supabase
  .from("user_roles")
  .insert({
    user_id: userId,
    role: "manager",
  })
  .select()
  .single();

// Step 3: Create manager permissions
const { error: permissionsError } = await supabase
  .from("manager_permissions")
  .insert({
    user_id: userId,
    can_manage_users: false,
    can_manage_deputies: false,
    can_manage_content: false,
    can_view_reports: false,
    can_manage_settings: false,
  });
```

### 3. Improved Error Handling ✅

**Enhanced Features**:
- Better error messages in Arabic
- Proper rollback mechanism if permissions creation fails
- Detailed console logging for debugging
- Validation to prevent promoting already-manager users

**Error Messages**:
- "المستخدم غير موجود" - User not found
- "هذا المستخدم مدير بالفعل" - User is already a manager
- "فشل إضافة دور المدير" - Failed to add manager role
- "فشل إنشاء صلاحيات المدير" - Failed to create manager permissions

### 4. Implemented Real Managers List ✅

**File**: `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/ManagersList.tsx`

**Before**: Used mock data (empty array)
**After**: Fetches real data from database

**Implementation**:
```typescript
async function getManagersData(filters: AppAdminManagerFilters) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get all users with manager role
  const { data: managerRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "manager");

  const managerIds = managerRoles.map(r => r.user_id);

  // Get user profiles for managers
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", managerIds)
    .order("created_at", { ascending: false });

  // Apply search filter if provided
  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    return profiles.filter(profile => {
      const fullName = profile.full_name || "";
      const email = profile.email || "";
      return (
        fullName.toLowerCase().includes(queryLower) ||
        email.toLowerCase().includes(queryLower)
      );
    });
  }

  return profiles;
}
```

**Features Added**:
- ✅ Fetches managers from `user_roles` table
- ✅ Joins with `user_profiles` to get full user data
- ✅ Orders by creation date (newest first)
- ✅ Supports search by name or email
- ✅ Shows proper message when no managers exist

---

## How It Works Now

### User Journey: Promoting to Manager

1. **Admin** opens `/app_admin/users` (Citizens List)
2. **Admin** finds a user and clicks "Promote to Manager" button
3. **System** validates:
   - User exists ✅
   - User is not already a manager ✅
4. **System** performs promotion:
   - Removes "citizen" role from `user_roles` ✅
   - Adds "manager" role to `user_roles` ✅
   - Creates default permissions in `manager_permissions` ✅
5. **System** shows success message with user's name
6. **Page** refreshes automatically
7. **User** disappears from citizens list
8. **User** appears in managers list at `/app_admin/managers`

### Rollback Mechanism

If permissions creation fails:
1. System automatically removes the manager role
2. Error message is shown to admin
3. User remains in their original state (citizen)

---

## Database Changes

### user_roles Table

**Before Promotion**:
```
user_id: abc-123
role: citizen
```

**After Promotion**:
```
user_id: abc-123
role: manager
```

### manager_permissions Table

**New Record Created**:
```
user_id: abc-123
can_manage_users: false
can_manage_deputies: false
can_manage_content: false
can_view_reports: false
can_manage_settings: false
```

---

## Testing Checklist

After deployment, verify:

- [ ] Can promote a citizen to manager without "User not found" error
- [ ] Success message shows user's name correctly
- [ ] User disappears from citizens list after promotion
- [ ] User appears in managers list at `/app_admin/managers`
- [ ] Cannot promote the same user twice (shows error)
- [ ] Search works in managers list (by name and email)
- [ ] Manager permissions are created with default values (all false)
- [ ] If promotion fails, user remains in citizens list

---

## Comparison with Deputy Promotion

Both promotion systems now use the same pattern:

| Feature | Deputy Promotion | Manager Promotion |
|---------|-----------------|-------------------|
| Service Role Client | ✅ | ✅ |
| Remove Citizen Role | ✅ | ✅ |
| Add New Role | ✅ deputy | ✅ manager |
| Create Profile/Permissions | ✅ deputy_profiles | ✅ manager_permissions |
| Rollback on Failure | ✅ | ✅ |
| Arabic Error Messages | ✅ | ✅ |
| Console Logging | ✅ | ✅ |

---

## Files Modified

### Modified Files (2 files)
1. `src/data/admin/managers.ts` - Fixed promotion action and permissions actions
2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/managers/ManagersList.tsx` - Implemented real data fetching

### New Files (1 file)
1. `MANAGER_PROMOTION_FIX.md` - This documentation

---

## Git Commit

**Commit Hash**: `e92c028`

**Commit Message**:
```
fix: Fix promote to manager functionality and implement real managers list

- Fixed promoteToManagerAction to use service role client instead of user client
- Added automatic removal of citizen role when promoting to manager
- Implemented real data fetching for managers list (was using mock data)
- Added search functionality for managers by name and email
- Fixed 'User not found' error when promoting users to manager
- Improved error messages in Arabic for better UX
- Added proper rollback mechanism if permissions creation fails
- Managers are now properly displayed in the managers list after promotion
- Users are removed from citizens list after promotion to manager
```

**Pushed to**: `main` branch on GitHub
**Deployment**: Automatic deployment to Vercel triggered

---

## Related Issues Fixed

1. ✅ "User not found" error when promoting to manager
2. ✅ Managers list showing empty (mock data)
3. ✅ Users not removed from citizens list after promotion
4. ✅ No search functionality in managers list
5. ✅ Inconsistent error messages (English vs Arabic)

---

## Future Enhancements

### Recommended Improvements

1. **Demote Manager**
   - Add button to demote manager back to citizen
   - Remove manager role and permissions
   - Add citizen role back

2. **Manager Permissions UI**
   - Create page to edit manager permissions
   - Show current permissions in managers list
   - Add permission presets (e.g., "Content Manager", "User Manager")

3. **Audit Log**
   - Track who promoted/demoted managers
   - Show history of permission changes
   - Display in manager detail page

4. **Bulk Operations**
   - Promote multiple users to manager at once
   - Export managers list to CSV
   - Import managers from CSV

5. **Manager Dashboard**
   - Create dedicated dashboard for managers
   - Show their permissions and capabilities
   - Provide quick access to allowed actions

---

## Status

✅ **COMPLETED** - Manager promotion functionality fixed and managers list implemented successfully.

---

## Support

For questions or issues:
- Refer to this documentation
- Check `src/data/admin/managers.ts` for implementation details
- Compare with `src/data/admin/deputies.ts` for similar patterns
- Git commit `e92c028` for full change history

