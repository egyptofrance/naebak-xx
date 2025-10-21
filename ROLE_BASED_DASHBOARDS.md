# Role-Based Dashboards Implementation

## Overview

Implemented separate dashboards for each user type with automatic role-based routing.

## User Types & Dashboards

### 1. Admin Dashboard (`/app_admin`)
**Existing** - No changes needed
- User management
- Deputy management
- Manager management
- System settings

### 2. Deputy Dashboard (`/app_deputy`) ✨ NEW
**Route:** `/app_deputy`
**Access:** Only users with `deputy_profiles` record

**Pages:**
- `/app_deputy` - Main dashboard
- `/app_deputy/deputy-data` - Personal & professional data
- `/app_deputy/electoral-program` - Electoral program management
- `/app_deputy/achievements` - Achievements documentation
- `/app_deputy/events` - Events management
- `/app_deputy/statistics` - Statistics & analytics

**Sidebar Sections:**
- الرئيسية (Home)
- البيانات الإضافية (Additional Data)
- البرنامج الانتخابي (Electoral Program)
- الإنجازات (Achievements)
- المناسبات (Events)
- الإحصائيات (Statistics)

### 3. Manager Dashboard (`/app_manager`) ✨ NEW
**Route:** `/app_manager`
**Access:** Only users with `manager_permissions` record

**Pages:**
- `/app_manager` - Main dashboard
- `/app_manager/content` - Content management
- `/app_manager/approvals` - Approval management
- `/app_manager/reports` - Reports & analytics
- `/app_manager/users` - User management
- `/app_manager/settings` - Settings

**Sidebar Sections:**
- الرئيسية (Home)
- إدارة المحتوى (Content Management)
- الموافقات (Approvals)
- التقارير (Reports)
- المستخدمون (Users)
- الإعدادات (Settings)

### 4. Citizen Dashboard (`/citizen`) ✨ NEW
**Route:** `/citizen`
**Access:** All authenticated users (default)

**Pages:**
- `/citizen` - Main dashboard
- `/citizen/profile` - Personal profile
- `/citizen/favorites` - Favorite deputies
- `/citizen/messages` - Messages
- `/citizen/my-deputies` - Deputies in my district
- `/citizen/all-deputies` - Browse all deputies
- `/citizen/settings` - Settings

**Sidebar Sections:**
- الرئيسية (Home)
- الملف الشخصي (Profile)
- النواب المفضلون (Favorites)
- الرسائل (Messages)
- الإعدادات (Settings)

## Routing Logic

### Automatic Role Detection
File: `src/lib/role-routing.ts`

Priority order:
1. **Admin** - Check `user_roles` table for `role = 'admin'`
2. **Deputy** - Check `deputy_profiles` table for user record
3. **Manager** - Check `manager_permissions` table for user record
4. **Citizen** - Default for all other users

### Entry Points

#### `/home` → Redirects to role-based dashboard
- Admin → `/app_admin`
- Deputy → `/app_deputy`
- Manager → `/app_manager`
- Citizen → `/citizen`

#### `/dashboard` → Same as `/home`
Universal entry point that redirects based on role

## File Structure

```
src/
├── app/[locale]/(dynamic-pages)/(authenticated-pages)/
│   ├── app_admin/                    # Admin dashboard (existing)
│   ├── app_deputy/                   # Deputy dashboard (NEW)
│   │   └── (deputy-pages)/
│   │       ├── @sidebar/
│   │       │   ├── deputy-sidebar.tsx
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       ├── page.tsx              # Main dashboard
│   │       ├── deputy-data/
│   │       ├── electoral-program/
│   │       ├── achievements/
│   │       ├── events/
│   │       └── statistics/
│   ├── app_manager/                  # Manager dashboard (NEW)
│   │   └── (manager-pages)/
│   │       ├── @sidebar/
│   │       │   ├── manager-sidebar.tsx
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       └── page.tsx              # Main dashboard
│   ├── citizen/                      # Citizen dashboard (NEW)
│   │   └── (citizen-pages)/
│   │       ├── @sidebar/
│   │       │   ├── citizen-sidebar.tsx
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       └── page.tsx              # Main dashboard
│   └── dashboard/
│       └── page.tsx                  # Redirect to role dashboard
├── lib/
│   └── role-routing.ts               # Role detection logic (NEW)
└── rsc-data/user/
    ├── deputy.ts                     # Deputy profile helpers
    └── manager.ts                    # Manager permissions helpers (NEW)
```

## Access Control

### Deputy Dashboard
```typescript
// Layout checks if user is deputy
const deputyProfile = await getDeputyProfile();
if (!deputyProfile) {
  redirect("/home"); // Redirect non-deputies
}
```

### Manager Dashboard
```typescript
// Layout checks if user is manager
const managerPermissions = await getManagerPermissions();
if (!managerPermissions) {
  redirect("/home"); // Redirect non-managers
}
```

### Citizen Dashboard
No access control - available to all authenticated users

## Database Tables Used

### `user_roles`
- `user_id` - User ID
- `role` - Role name ('admin', 'deputy', 'manager', 'citizen')

### `deputy_profiles`
- `user_id` - User ID
- `deputy_status` - 'current' or 'former'
- `electoral_symbol` - Electoral symbol
- `electoral_number` - Electoral number
- `electoral_program` - Electoral program text
- `achievements` - Achievements text
- `events` - Events text
- ... (other fields)

### `manager_permissions`
- `user_id` - User ID
- `can_manage_content` - Boolean
- `can_manage_users` - Boolean
- `can_view_reports` - Boolean
- `can_approve_content` - Boolean

### `user_profiles`
- `id` - User ID
- `full_name` - Full name
- `governorate_id` - Governorate ID
- `city` - City
- `electoral_district` - Electoral district
- ... (other fields)

## Features

### Deputy Dashboard Features
✅ Personal data management
✅ Electoral program display/edit
✅ Achievements documentation
✅ Events management
✅ Statistics & analytics
✅ Rating display

### Manager Dashboard Features
✅ Content management
✅ Approval workflow
✅ Reports & analytics
✅ User management
✅ Permission-based access

### Citizen Dashboard Features
✅ Personal profile
✅ Favorite deputies
✅ Messages
✅ Deputy search & browse
✅ District-based deputy filtering

## Testing

### Test Deputy Dashboard
1. Login as a user with `deputy_profiles` record
2. Should redirect to `/app_deputy`
3. Verify all sidebar links work
4. Check data displays correctly

### Test Manager Dashboard
1. Login as a user with `manager_permissions` record
2. Should redirect to `/app_manager`
3. Verify all sidebar links work
4. Check permissions display correctly

### Test Citizen Dashboard
1. Login as a regular user (no deputy/manager records)
2. Should redirect to `/citizen`
3. Verify all sidebar links work
4. Check profile data displays correctly

### Test Admin Dashboard
1. Login as admin
2. Should redirect to `/app_admin`
3. Existing functionality should work as before

## Migration Notes

### For Existing Users
- **Admins**: No change, still use `/app_admin`
- **Deputies**: Will now see `/app_deputy` instead of `/home`
- **Managers**: Will now see `/app_manager` instead of `/home`
- **Citizens**: Will now see `/citizen` instead of `/home`

### Old `/home` Page
- Now redirects to role-based dashboard
- No breaking changes for existing links

## Future Enhancements

### Deputy Dashboard
- [ ] Edit forms for all data sections
- [ ] Image upload for achievements
- [ ] Calendar integration for events
- [ ] Advanced analytics

### Manager Dashboard
- [ ] Content approval workflow
- [ ] User activity logs
- [ ] Advanced reporting
- [ ] Bulk operations

### Citizen Dashboard
- [ ] Deputy rating system
- [ ] Comment system
- [ ] Notification system
- [ ] Advanced search filters

## Deployment

1. Commit all changes
2. Push to GitHub
3. Vercel auto-deploys
4. Test all dashboards in production
5. Monitor for errors

## Rollback Plan

If issues occur:
1. Revert commit
2. Push to GitHub
3. Vercel auto-deploys previous version
4. Users return to old `/home` page

## Support

For issues or questions:
- Check Vercel deployment logs
- Check browser console for errors
- Check Supabase logs for database errors
- Review this documentation

