# 🎯 Complete Admin System - MongoDB Edition

## ✅ What's Been Built

### 1. **Database Models** (MongoDB/Mongoose)

- **User Model** - Enhanced with `teamRole` field (LEADER/MEMBER)
- **Team Model** - Added `description` field
- **JoinRequest Model** - Approval workflow system
- **SiteSettings Model** - Dynamic configuration

### 2. **God Mode Admin Panel** 🔥

Located at `/admin/*` with full admin layout and sidebar:

#### **Dashboard** (`/admin/dashboard`)

- Real-time stats: Player count, Team count, Active status
- Overview of all platform metrics

#### **Players** (`/admin/players`)

- **Google Sheets CSV Import**
  - Upload CSV with columns: `email`, `name`, `rollNumber`
  - Bulk import players
  - Preview before importing
  - Duplicate detection

#### **Teams** (`/admin/teams`) - **GOD MODE HQ**

- **Force Add User to Team** - Bypass approval, add anyone instantly
- **Force Remove User** - Remove members even if they're leaders
- **Change Team Leader** - Promote/demote leaders
- **Edit Team Details** - Rename, change descriptions
- **Delete Teams** - Complete team removal with member cleanup
- **Force Approve Requests** - Bypass leader approval
- **View All Pending Requests** - Global overview
- **Drag-and-drop style management** (via Sheet component)

#### **Settings** (`/admin/settings`)

- Site name and event date
- Registration toggle
- Max/min team sizes
- Team creation permissions
- Join request permissions
- Hero section text (no code changes needed!)
- Announcement banner

### 3. **Join Request Workflow** (User Perspective)

#### For **Team Leaders**:

- View pending join requests on `/teams/my-team`
- Accept/Reject buttons inline
- Real-time updates

#### For **Members**:

- Browse teams on `/teams`
- Click "Request to Join"
- Status shown as PENDING
- Cannot join multiple teams while pending

### 4. **Admin Actions** (Server-Side)

File: `app/actions/admin-actions.ts`

- `forceAddUserToTeam()` - God mode add
- `forceRemoveUserFromTeam()` - Smart removal with leader handling
- `forceChangeTeamLeader()` - Instant role swap
- `forceEditTeam()` - Edit any team details
- `forceDeleteTeam()` - Nuclear option
- `forceApproveJoinRequest()` - Bypass leader
- `importPlayers()` - CSV bulk import

### 5. **Updated Regular Actions**

File: `app/actions/join-actions.ts`

- `requestToJoinTeam()` - Player requests to join
- `approveJoinRequest()` - Leader approves
- `rejectJoinRequest()` - Leader rejects

File: `app/actions/team-actions.ts`

- `createTeam()` - Auto-assigns LEADER role

## 🗂️ File Structure

```
app/
├── (admin)/
│   ├── admin/
│   │   ├── dashboard/page.tsx       # Stats overview
│   │   ├── players/page.tsx         # CSV import
│   │   ├── teams/
│   │   │   ├── page.tsx            # Server component
│   │   │   └── team-management-client.tsx  # Client interactions
│   │   ├── settings/page.tsx        # Site config
│   │   └── layout.tsx               # Admin sidebar
│   └── layout.tsx
│
├── (public)/
│   ├── page.tsx                     # Landing page
│   ├── leaderboard/page.tsx         # Public rankings
│   └── teams/
│       ├── page.tsx                 # Browse/join teams
│       ├── create/page.tsx          # Create team
│       └── my-team/page.tsx         # Team dashboard
│
├── actions/
│   ├── admin-actions.ts             # God mode functions
│   ├── team-actions.ts              # Create team
│   └── join-actions.ts              # Join workflow
│
lib/
├── mongodb.ts                       # Connection utility
└── models/
    ├── User.ts                      # User + teamRole
    ├── Team.ts                      # Team + description
    ├── JoinRequest.ts               # Approval system
    └── SiteSettings.ts              # Dynamic config
```

## 🚀 Next Steps

### 1. **Set Up MongoDB**

```bash
# Option A: Local MongoDB
# Download from https://www.mongodb.com/try/download/community

# Option B: MongoDB Atlas (Recommended)
# Sign up at https://www.mongodb.com/cloud/atlas
# Create cluster → Get connection string
```

### 2. **Update Environment**

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/springfiesta
```

### 3. **Run the App**

```bash
npm run dev
```

### 4. **Access Admin Panel**

Navigate to: `http://localhost:3000/admin/dashboard`

## 🎮 Admin Capabilities

You can now:

✅ **Import 100+ players** from Google Sheets in seconds  
✅ **Force-add anyone** to any team (no approval needed)  
✅ **Remove toxic members** even if they're leaders  
✅ **Promote new leaders** when originals go inactive  
✅ **Edit offensive team names** instantly  
✅ **Approve all pending requests** with one click  
✅ **Delete entire teams** and reassign members  
✅ **Change site settings** without touching code  
✅ **Toggle registration** on/off dynamically

## 🔧 Customization

### To change max team size:

Go to `/admin/settings` → Change "Maximum Team Size"

### To disable team creation:

Go to `/admin/settings` → Uncheck "Allow Team Creation"

### To update hero text:

Go to `/admin/settings` → Edit "Hero Title" and "Hero Subtitle"

## 🛡️ Security Notes

**IMPORTANT:** Add proper authentication before deploying!

Currently using mock user IDs. In production:

1. Implement Clerk/NextAuth
2. Add role checks: `if (user.role !== "ADMIN") return`
3. Protect `/admin/*` routes with middleware

## 📊 Database Schema

### User

```typescript
{
  email: string(unique);
  name: string;
  role: "USER" | "ADMIN";
  teamId: ObjectId | null;
  teamRole: "LEADER" | "MEMBER" | null;
  rollNumber: string | null;
  ign: string | null;
}
```

### Team

```typescript
{
  name: string(unique);
  teamCode: string(unique);
  leaderId: ObjectId;
  description: string;
}
```

### JoinRequest

```typescript
{
  userId: ObjectId;
  teamId: ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}
```

## 🎨 UI Components Used

- Shadcn UI (already configured)
- Sheet component for slide-out panels
- Badge for status indicators
- Tables for data display
- Cards for structured content

## 📝 Notes

- Team size limit: 5 members (configurable)
- Leaders can approve/reject requests
- Admins bypass all restrictions
- CSV import supports: email, name, rollNumber
- All MongoDB queries use lean() for performance
