# Quick Start: Setting Up Admin Access

## For Development (Using MongoDB Compass or CLI)

### Method 1: MongoDB CLI

```bash
# Connect to your MongoDB
mongo "............................."

# Switch to the database
use surat-spring-fiesta

# Make a user admin
db.users.updateOne(
  { email: "your-email@gmail.com" },
  { $set: { role: "ADMIN" } }
)

# Verify
db.users.findOne({ email: "your-email@gmail.com" })
```

### Method 2: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your MongoDB cluster
3. Navigate to Database → Users Collection
4. Find your user document
5. Edit and set `role: "ADMIN"`
6. Save

---

## Expected Database Fields

A user in the collection should look like:

```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "User Name",
  "role": "ADMIN",  // ← Change to ADMIN
  "teamId": null,
  "teamRole": null,
  "isProfileComplete": true,
  "ign": "InGameName",
  "rollNumber": "2024001",
  "avatarUrl": "https://...",
  "isActive": true,
  "createdAt": ISODate("2026-02-03..."),
  "updatedAt": ISODate("2026-02-03...")
}
```

---

## Verify Admin Access

After updating the database:

1. **Log out** from the application
2. **Sign out** completely
3. **Log back in** with the admin account
4. Navigate to `/admin/dashboard`
5. You should see the "GOD MODE" sidebar

If you don't see the admin panel:

- Check MongoDB to confirm `role: "ADMIN"`
- Clear browser cache
- Try incognito/private browsing

---

## Admin Panel Locations

Once logged in as admin, access:

| Feature         | URL                |
| --------------- | ------------------ |
| Dashboard       | `/admin/dashboard` |
| Players         | `/admin/players`   |
| Teams           | `/admin/teams`     |
| Bracket Manager | `/admin/brackets`  |
| Settings        | `/admin/settings`  |

---

## Tournament Bracket Workflow

### 1. Create Bracket

- Go to `/admin/brackets`
- Click "Auto-Generate Bracket"
- Choose 4, 8, or 16 teams
- Creates all matches with "TBD" status

### 2. Assign Teams

- Edit matches in Round 1
- Select Team 1 and Team 2 from active teams
- Save → Status changes to "SCHEDULED"

### 3. Run Tournament

- As matches happen, update to "LIVE"
- Enter scores for both teams
- Mark as "COMPLETED"
- System updates leaderboard automatically

### 4. Public View

- Go to `/brackets` to see tournament progress
- Shows all rounds and match results
- Updates in real-time

---

## Users See Brackets As TBD By Default

✅ **Correct Behavior**: When teams aren't assigned, users see:

- "TBD vs TBD"
- Match status as TBD
- No scores displayed

✅ **After Teams Assigned**:

- Team names appear
- Match marked as "SCHEDULED"
- Visible to all users

✅ **During/After Match**:

- Shows "LIVE" or "COMPLETED"
- Displays scores
- Shows winner with crown icon

---

## Example: Complete Tournament Flow

### Day 1: Setup

```
Admin → Auto-Generate Bracket (8 teams)
Creates:
  - Round 1: 4 matches (8 teams)
  - Round 2: 2 matches (4 teams)
  - Round 3: 1 match (2 teams)
Status: All TBD
Public View: Shows TBD brackets
```

### Day 2-3: Tournament Day

```
Admin updates in real-time:
  Match 1.1: Team A vs Team B → LIVE → COMPLETED (A wins)
  Match 1.2: Team C vs Team D → LIVE → COMPLETED (C wins)
  ...
Leaderboard auto-updates
Public sees live progress
```

### Final: Winners Crowned

```
Match 3: Team A vs Team C → COMPLETED (A wins)
A becomes champion
Leaderboard shows final standings
```

---

## Troubleshooting

### Admin Panel Not Showing

- ❌ Not logged in → Log in first
- ❌ role is "USER" → Update to "ADMIN" in MongoDB
- ❌ Cached old login → Clear cache and log in again

### Brackets Not Appearing

- ❌ No matches created → Click "Auto-Generate Bracket"
- ❌ Wrong database → Check MongoDB connection
- ❌ Teams not assigned → Edit matches and select teams

### Scores Not Updating

- ❌ Status must be "COMPLETED" → Change from LIVE
- ❌ Winner not selected → Choose winner in edit dialog
- ❌ Page not refreshed → Page auto-refreshes, but refresh manually if needed

---

## Contact & Support

For issues:

1. Check MongoDB is connected (`✅ MongoDB connected successfully` in terminal)
2. Verify user `role: "ADMIN"` in database
3. Check browser console for errors
4. Check server terminal for error messages

Happy Tournament! 🏆
