# 🏆 IIIT Surat Spring Fiesta 2026 - Complete System Guide

## Project Overview

A full-featured team management and tournament bracket system for IIIT Surat's Spring Fiesta 2026 event built with Next.js, MongoDB, and NextAuth.

**Live URL**: `http://localhost:3000`

---

## 📋 Table of Contents

1. [User Features](#user-features)
2. [Admin Features](#admin-features)
3. [Tournament Brackets](#tournament-brackets)
4. [How to Access](#how-to-access)
5. [Database Models](#database-models)
6. [Quick Commands](#quick-commands)

---

## 👥 User Features

### Public Pages (No Login Required)

- **Home** (`/`) - Landing page
- **Leaderboard** (`/leaderboard`) - View all teams and players ranked by score
- **All Teams** (`/teams`) - Browse and request to join teams
- **All Players** (`/leaderboard?tab=players`) - View all registered players
- **Brackets** (`/brackets`) - View tournament matches and progress

### Authenticated User Pages

- **Dashboard** (`/dashboard`) - Personal stats, team info, pending requests
- **My Team** (`/teams/my-team`) - Manage team (if user is a member or leader)
- **Create Team** (`/teams/create`) - Create a new team
- **Profile** (`/profile`) - View profile details
- **Settings** (`/settings`) - Update personal settings

### User Actions

- ✅ Google OAuth login
- ✅ Complete profile (Name, IGN, Roll Number)
- ✅ Create a team (becomes team leader)
- ✅ Request to join other teams
- ✅ Leave team
- ✅ View leaderboard standings
- ✅ See tournament bracket progress

---

## 🛡️ Admin Features

### Admin Panel Access

**URL**: `/admin/dashboard`

**Requirements**:

1. User must be logged in
2. User's role must be `"ADMIN"` in MongoDB
3. Access is role-based protected

### Admin Dashboard (`/admin/dashboard`)

- 📊 Total players count
- ⚔️ Active teams count
- 🎯 Tournament progress
- 💚 Server health status

### Player Management (`/admin/players`)

- 👥 View all players
- 🔍 Search and filter
- 📥 Import players via CSV
- 📤 Export players to CSV
- ➕ Manually add players
- ➖ Remove players from event
- 🔗 Force assign players to teams

### Team Management (`/admin/teams`)

- ⚔️ View all teams
- ✅ Approve/Reject join requests
- 👤 Force add members to teams
- 🚫 Force remove members
- 👑 Change team leader
- ✏️ Edit team details
- 🗑️ Delete entire teams
- 📊 View member counts

### Tournament Bracket (`/admin/brackets`) ⭐ NEW

- 🏆 Create tournament structure
- 🎲 Auto-generate bracket (4, 8, 16 teams)
- ➕ Add individual matches
- ✏️ Update match details
- 🎯 Set team assignments
- 📊 Update scores in real-time
- ✓ Mark match as completed
- 🏅 Declare winners
- ⏰ Schedule matches
- 📋 View all match results

### Site Settings (`/admin/settings`)

- ⚙️ Configure tournament details
- 🔧 Manage event settings

---

## 🏆 Tournament Brackets System

### What Users See

**Before Teams Assigned**:

```
Round 1: TBD vs TBD [TBD Status]
```

**After Teams Assigned**:

```
Round 1: Team A vs Team B [SCHEDULED]
         Team C vs Team D [SCHEDULED]
```

**During Tournament**:

```
Round 1: Team A 15 vs 12 Team B [🔴 LIVE]
         Team C 10 vs 8 Team D [COMPLETED] ✓
```

**After Tournament**:

```
Finals: Team A 20 vs 15 Team C [COMPLETED] ✓ Winner: Team A 👑
```

### Match Statuses

| Status        | Meaning                       | User Sees                            |
| ------------- | ----------------------------- | ------------------------------------ |
| **TBD**       | Teams not assigned            | "TBD vs TBD"                         |
| **SCHEDULED** | Teams assigned, match pending | Team names, no scores                |
| **LIVE**      | Match is happening now        | 🔴 Live indicator, live score update |
| **COMPLETED** | Match finished                | Final score, winner with 👑          |

### Creating a Tournament (Admin)

#### Step 1: Generate Bracket

```
1. Go to /admin/brackets
2. Click "Auto-Generate Bracket"
3. Select: 4 teams (2 rounds), 8 teams (3 rounds), or 16 teams (4 rounds)
4. System creates all matches with "TBD" status
```

#### Step 2: Assign Teams

```
1. Edit each match in Round 1
2. Select Team 1 and Team 2 from dropdown
3. Status auto-changes to "SCHEDULED"
4. Public sees team names immediately
```

#### Step 3: Run Tournament

```
For each match:
1. Click Edit
2. Change status to "LIVE"
3. Update scores in real-time
4. When finished: Change to "COMPLETED"
5. Select winner
6. System auto-updates leaderboard!
```

#### Step 4: Winners Auto-Advance

```
Winners from Round 1 automatically qualify for Round 2
No manual assignment needed - just mark the winner!
```

---

## 🔐 How to Access Admin Panel

### 1. Make User an Admin

**Method A: MongoDB CLI** (fastest)

```bash
mongo "your-mongodb-connection-string"
use surat-spring-fiesta
db.users.updateOne(
  { email: "your-email@gmail.com" },
  { $set: { role: "ADMIN" } }
)
```

**Method B: MongoDB Compass**

1. Open MongoDB Compass
2. Connect to database
3. Find user in `users` collection
4. Edit document
5. Change `role: "USER"` → `role: "ADMIN"`
6. Save

### 2. Login with Admin Account

```
1. Navigate to http://localhost:3000
2. Click "Sign In"
3. Login with the email that has role: "ADMIN"
4. You'll see "GOD MODE" sidebar option
```

### 3. Access Admin Panel

```
Direct URL: /admin/dashboard
Or click "Admin Panel" in user dropdown menu
```

---

## 📊 Database Models

### Users

```javascript
{
  email: String (unique),
  name: String,
  role: "USER" | "ADMIN",
  teamId: ObjectId (ref: Team),
  teamRole: "LEADER" | "MEMBER" | null,
  ign: String (In-Game Name),
  rollNumber: String,
  phone: String,
  avatarUrl: String,
  isProfileComplete: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Teams

```javascript
{
  name: String (unique),
  teamCode: String (unique),
  leaderId: ObjectId (ref: User),
  description: String,
  score: Number,
  wins: Number,
  losses: Number,
  status: "ACTIVE" | "INACTIVE" | "DISQUALIFIED",
  maxMembers: Number (default: 5),
  createdAt: Date,
  updatedAt: Date
}
```

### Matches (NEW)

```javascript
{
  tournamentName: String,
  round: Number,
  matchNumber: Number,
  team1Id: ObjectId (ref: Team) | null,
  team2Id: ObjectId (ref: Team) | null,
  team1Score: Number,
  team2Score: Number,
  winnerId: ObjectId (ref: Team) | null,
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED",
  scheduledAt: Date | null,
  completedAt: Date | null,
  nextMatchId: ObjectId (ref: Match) | null,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### JoinRequests

```javascript
{
  userId: ObjectId (ref: User),
  teamId: ObjectId (ref: Team),
  status: "PENDING" | "APPROVED" | "REJECTED",
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Key Features Summary

| Feature             | User     | Admin    | Public |
| ------------------- | -------- | -------- | ------ |
| View Leaderboard    | ✅       | ✅       | ✅     |
| Browse Teams        | ✅       | ✅       | ✅     |
| Request to Join     | ✅       | ✅       | ❌     |
| Create Team         | ✅       | ✅       | ❌     |
| Manage Team         | ✅ (own) | ✅ (all) | ❌     |
| View Brackets       | ✅       | ✅       | ✅     |
| **Manage Brackets** | ❌       | ✅       | ❌     |
| **Update Scores**   | ❌       | ✅       | ❌     |
| **Manage Players**  | ❌       | ✅       | ❌     |
| View Admin Panel    | ❌       | ✅       | ❌     |

---

## ⚙️ Quick Commands

### Start Development Server

```bash
cd c:\Desktop\IIITSurat_SF\fold
npm run dev
# Server runs on http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

### MongoDB Connection

```
Check .env.local for:
MONGODB_URI=mongodb+srv://...
```

### Stop Server

```bash
# In PowerShell:
Get-Process -Name "node" | Stop-Process -Force
```

---

## 📝 Important Notes

### Brackets Default State

✅ Correct: When first created, matches show "TBD vs TBD"
✅ Correct: Users cannot see team names until admin assigns them
✅ Correct: Only admin can update bracket and scores

### Team Size

- Maximum 5 members per team
- Can be changed in Team model `maxMembers` field

### Admin Permissions

- Can force assign/remove players to teams
- Can approve/reject team join requests
- Can manage all tournament aspects
- Can update leaderboard scores

### Leaderboard

- Sorted by score (highest first)
- Auto-updates when:
  - Team wins a match
  - Admin manually updates team stats
- Wins/losses tracked from bracket matches

---

## 🆘 Troubleshooting

### Can't Access Admin Panel

- ✅ Check user role is "ADMIN" in MongoDB
- ✅ Log out and log back in
- ✅ Clear browser cache

### Brackets Not Showing

- ✅ Create bracket with "Auto-Generate" button
- ✅ Check MongoDB is connected

### Scores Not Updating

- ✅ Mark match as "COMPLETED" first
- ✅ Select a winner
- ✅ Page auto-refreshes (or refresh manually)

### Users Can't See Brackets

- ✅ Brackets are public, no login needed
- ✅ Public view is at `/brackets`
- ✅ Users see "TBD" until admin assigns teams

---

## 📞 Support

Check:

1. **Browser Console** - For frontend errors (F12 → Console)
2. **Server Terminal** - For backend errors
3. **MongoDB Status** - Should see "✅ MongoDB connected successfully"
4. **User Permissions** - Admin must have `role: "ADMIN"`

---

## 🎉 You're All Set!

The system is ready for Spring Fiesta 2026. Start by:

1. ✅ Making an admin user
2. ✅ Creating test teams
3. ✅ Setting up tournament bracket
4. ✅ Testing live score updates
5. ✅ Sharing `/brackets` link with participants

Happy Tournament! 🏆
