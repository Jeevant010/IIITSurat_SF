# IIIT Surat Spring Fiesta 2026 - Admin Guide

## 🎭 Welcome Admin!

This comprehensive admin system gives you **god-mode** control over the entire Spring Fiesta 2026 platform. You can manage players, teams, join requests, and all event data through a powerful UI interface.

## 🚀 Quick Start

### Access Admin Panel

Navigate to: `/admin/dashboard`

### Admin Features Overview

## 📊 Dashboard (`/admin/dashboard`)

Your central hub showing:

- Total players registered
- Active teams
- Pending join requests
- Recent activity
- Quick actions

## 👥 Player Management (`/admin/players`)

### View All Players

- See complete list of all registered participants
- Filter by: All Players, In Teams, Free Agents
- Search by name, email, or roll number
- Export player data to CSV

### Import Players (Google Sheets Integration)

1. **Prepare CSV**: Export from Google Sheets with columns: `email`, `name`, `rollNumber`, `ign`
2. **Upload**: Click "Import CSV" button
3. **Review**: Preview first 5 rows
4. **Import**: System automatically handles duplicates

### Individual Player Actions

- ✏️ **Edit Player**: Update name, email, roll number, IGN, or role
- 🗑️ **Delete Player**: Remove player completely (also removes from team)
- 👤 **Add to Team**: Force-add player to any team
- ❌ **Remove from Team**: Remove player from their current team
- ➕ **Create Player**: Manually add new player

### Bulk Actions

- Import hundreds of players at once
- Export all player data
- Filter and search efficiently

## 🎯 Team Management (`/admin/teams`)

### God Mode Powers

#### View All Teams

- Complete team roster with member counts
- Pending join requests per team
- Team descriptions and codes
- Leader information

#### Team Actions

- ✏️ **Edit Team**: Change name, description, team code
- 👑 **Change Leader**: Promote any team member to leader
- ➕ **Add Member**: Force-add any player to team (bypasses approval)
- ❌ **Remove Member**: Remove any member from team
- 🗑️ **Delete Team**: Completely delete team (removes all members)
- ✅ **Approve Requests**: Manually approve join requests
- ❌ **Reject Requests**: Decline join requests

#### Team Limits

- Maximum 5 members per team
- One leader per team
- System enforces limits automatically

### Join Request Management

**As Admin, you can:**

- View ALL pending requests across all teams
- Approve requests even if team leader hasn't
- Reject spam/invalid requests
- Override team size limits (with caution!)

## ⚙️ Settings (`/admin/settings`)

Configure global platform settings:

- Event dates
- Registration open/close
- Max team size (default: 5)
- Feature flags
- Announcement banners

## 🎨 User Experience Features

### Loading Screens

The platform includes entertaining loading messages for free-tier delays:

- Funny messages rotate every 3 seconds
- Progress bars with animations
- 20+ unique loading messages
- Prevents user frustration during 1-2 minute loads

### UI Features

- **Responsive Design**: Works on mobile, tablet, desktop
- **Real-time Updates**: Changes reflect immediately
- **Confirmation Dialogs**: Prevents accidental deletions
- **Search & Filter**: Find anything quickly
- **Export Options**: Download data as CSV

## 🔧 Common Admin Tasks

### Scenario 1: Importing Players from Google Sheets

```
1. Get player list from Google Form responses
2. Download as CSV (File → Download → CSV)
3. Go to /admin/players
4. Click "Import CSV"
5. Select downloaded file
6. Review preview
7. Click import
8. Check results (imported vs skipped)
```

### Scenario 2: Manually Creating a Team

```
1. Go to /admin/teams
2. Create players first if needed (/admin/players → Add Player)
3. Click "Create Team"
4. Fill in details
5. Assign leader
6. Add members
```

### Scenario 3: Resolving Team Conflicts

**Player wants to leave team:**

```
1. Go to /admin/players
2. Find player
3. Click "Remove from Team"
4. Player is now free agent
```

**Team leader disputes:**

```
1. Go to /admin/teams
2. Find team
3. Click "Change Leader"
4. Select new leader from members
5. Old leader becomes regular member
```

### Scenario 4: Managing Join Requests

**Approve all pending for a team:**

```
1. Go to /admin/teams
2. View team details
3. See pending requests section
4. Approve/reject each one
```

**Force-add player to team:**

```
1. Go to /admin/players
2. Find free agent
3. Select team from dropdown
4. Click "Add to Team"
5. Bypasses approval process
```

## 📱 Public Pages (What Users See)

### `/teams` - Browse Teams

- All users can see available teams
- Request to join any team with open slots
- View team details, leaders, member counts

### `/teams/create` - Create Team

- Any user can create their own team
- Becomes team leader automatically
- Sets team name, tag, description

### `/teams/my-team` - My Team Dashboard

- View own team
- **Leaders**: Approve/reject join requests
- **Leaders**: Remove members
- **Leaders**: Manage team details
- **Members**: View team info, leave team

### `/players` - Public Player List

- See all registered participants
- Filter by team status
- Search by name or IGN
- View team affiliations

## 🛡️ Security & Permissions

### Admin Abilities (You)

- Full CRUD on all entities
- Override all restrictions
- View all data
- Export all data
- Delete anything

### Team Leader Abilities

- Approve/reject join requests for THEIR team
- Remove members from THEIR team
- Edit THEIR team details
- Cannot delete team
- Cannot force-add players

### Regular User Abilities

- Create one team
- Join teams (with approval)
- Leave team
- View public data

## 🎯 Best Practices

### 1. Bulk Import First

- Import all players from Google Sheets before event starts
- Let players join/create teams themselves
- Only manually intervene when needed

### 2. Monitor Join Requests

- Check pending requests daily
- Approve legitimate ones if leaders are slow
- Reject spam/duplicate requests

### 3. Team Size Management

- Keep teams at 5 members max
- System enforces but you can override
- Only override with good reason

### 4. Data Backups

- Export player and team data regularly
- Use CSV export features
- Keep records of major changes

### 5. Communication

- Use team codes for easy identification
- Share public player list link with participants
- Post announcements about deadlines

## 🐛 Troubleshooting

### "Import failed" Error

**Cause**: CSV format issue  
**Fix**: Ensure proper column names (email, name), check for special characters

### "Team is full" Warning

**Cause**: Trying to add 6th member  
**Fix**: Remove a member first, or use force-add (not recommended)

### Players Can't See Their Team

**Cause**: Player not properly linked to team  
**Fix**: Go to /admin/players, remove from team, re-add properly

### Duplicate Emails on Import

**Cause**: Email already exists in database  
**Fix**: Normal behavior - duplicates are skipped, update manually if needed

## 📊 Data Export

### Export Players

```
1. Go to /admin/players
2. Click "Export" button
3. Downloads CSV with:
   - Name, Email, Roll Number, IGN
   - Team name and code
   - Role in team
```

### Use Cases

- Share participant list with sponsors
- Create certificates
- Send mass emails
- Backup data

## 🎉 Event Day Checklist

- [ ] All players imported
- [ ] All teams formed and confirmed
- [ ] No pending join requests
- [ ] Team sizes verified (≤5 members)
- [ ] Player data exported for backup
- [ ] Public pages working and accessible
- [ ] Loading screens tested (they're fun!)

## 🆘 Need Help?

### Common Questions

**Q: Can I delete a team leader?**  
A: System will promote another member or delete team if no members remain

**Q: What happens to join requests when a team is deleted?**  
A: All requests for that team are automatically deleted

**Q: Can players be in multiple teams?**  
A: No, one team per player. System enforces this.

**Q: How to make someone admin?**  
A: Edit player, change role to "ADMIN"

## 🎭 Have Fun!

Remember: This is Spring Fiesta 2026! Keep it fun, engaging, and memorable for participants. The loading screens are there to make even the technical delays entertaining!

---

**Happy Managing! 🚀**  
_IIIT Surat Spring Fiesta 2026 Team_
