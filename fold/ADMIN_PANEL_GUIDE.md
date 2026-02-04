# Admin Panel Access Guide - IIIT Surat Spring Fiesta 2026

## How to Access the Admin Panel

### 1. **Login with Admin Account**

- Navigate to `http://localhost:3000` (or your deployed URL)
- Click "Sign In"
- Use a Google account that has been given ADMIN role in the database

### 2. **Direct Access**

- Once logged in with an admin account, navigate to: `/admin/dashboard`
- The admin panel is protected and will redirect non-admin users

### 3. **Making Someone an Admin**

Currently, users are created with `role: "USER"` by default. To make someone an admin:

**Option A: Database Direct Update** (MongoDB)

```javascript
// Connect to your MongoDB and run:
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } });
```

**Option B: Create Admin Function** (Add to admin-actions.ts)

```typescript
export async function promoteUserToAdmin(email: string) {
  await connectDB();

  const result = await User.findOneAndUpdate(
    { email },
    { role: "ADMIN" },
    { new: true },
  );

  if (result) {
    return { success: true, message: `${email} is now an admin` };
  }
  return { success: false, message: "User not found" };
}
```

---

## Admin Panel Features

### 📊 Admin Dashboard (`/admin/dashboard`)

- **Overview Stats**: Total players, active teams, tournament progress, server health
- Quick access to all admin functions
- Real-time statistics

### 👥 Player Roster (`/admin/players`)

- View all registered players
- Search and filter by team, status
- Import/Export players via CSV
- Manually add or remove players
- Assign players to teams forcefully

### ⚔️ Clan Manager (`/admin/teams`)

- Manage all teams
- Approve/Reject join requests
- Force add/remove users from teams
- Change team leaders
- Edit team details
- Delete entire teams
- View pending join requests

### 🏆 Tournament Bracket (`/admin/brackets`)

**Key Features:**

- **Create Matches Manually** - Add individual matches with teams and schedules
- **Auto-Generate Bracket** - Automatically create bracket structure (4, 8, or 16 team)
- **Update Match Results** - Set scores and mark winners
- **Track Match Status** - TBD → Scheduled → Live → Completed
- **Schedule Matches** - Set date/time for each match

### ⚙️ Site Settings (`/admin/settings`)

- Configure site settings
- Manage tournament details
- Update event information

---

## Tournament Bracket Management

### Setting Up a Tournament

#### Step 1: Generate Bracket Structure

1. Go to `/admin/brackets`
2. Click "Auto-Generate Bracket"
3. Select team count (4, 8, or 16)
4. System creates all matches with "TBD" status

#### Step 2: Assign Teams

1. Each match in Round 1 can be edited
2. Click Edit on a match
3. Select Team 1 and Team 2
4. Status automatically changes to "SCHEDULED"

#### Step 3: Track Matches

- **TBD** - Teams not yet assigned
- **Scheduled** - Teams assigned, waiting to play
- **Live** - Match is happening now
- **Completed** - Match finished with a winner

#### Step 4: Update Scores

1. Click Edit on a match
2. Enter Team 1 Score and Team 2 Score
3. Select Winner
4. Change Status to "COMPLETED"
5. System auto-updates team wins/losses and leaderboard

### Public View

Users can view the tournament bracket at `/brackets`

- Shows all matches organized by round
- Displays team names and scores
- Highlights live matches
- Shows completed matches with winners
- Initially displays "TBD" when teams aren't assigned yet

---

## User Roles & Permissions

| Role       | Can Access                                          |
| ---------- | --------------------------------------------------- |
| **USER**   | Dashboard, Teams, Leaderboard, Brackets (view only) |
| **ADMIN**  | Admin Panel + All USER features                     |
| **LEADER** | Manage own team, approve join requests              |

---

## Tournament Bracket Status Flow

```
TBD
↓
SCHEDULED (once teams assigned)
↓
LIVE (match is being played)
↓
COMPLETED (winner declared, stats updated)
```

---

## Managing Tournament Progress

### During Tournament

1. Set matches to "LIVE" as they begin
2. Update scores in real-time
3. Mark as "COMPLETED" when finished
4. Next round winners auto-qualify to their bracket positions

### After Tournament

- All stats are finalized
- Leaderboard reflects final standings
- Brackets show complete tournament history

---

## API Actions Available

All actions are Server Actions in Next.js. See `/app/actions/bracket-actions.ts`:

- `createMatch()` - Create individual match
- `updateMatch()` - Update match details, scores, winner
- `deleteMatch()` - Remove a match
- `generateBracket()` - Auto-create bracket structure
- `assignTeamsToFirstRound()` - Randomize team assignment

---

## Quick Links

- **Admin Dashboard**: `/admin/dashboard`
- **Bracket Manager**: `/admin/brackets`
- **Public Brackets**: `/brackets`
- **Team Manager**: `/admin/teams`
- **Player Roster**: `/admin/players`

---

## Support

For issues or questions, check:

1. Browser console for errors
2. Server logs for backend errors
3. MongoDB connection status
4. User role permissions

Ensure your user has `role: "ADMIN"` in the database!
