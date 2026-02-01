# 🎭 IIIT Surat Spring Fiesta 2026

> A comprehensive team management and event platform for IIIT Surat's Spring Fiesta 2026 cultural event.

## ✨ Features

### 🎯 For Players

- **Team Creation**: Create your own team and become a leader
- **Team Browsing**: Explore all available teams with descriptions
- **Join Requests**: Request to join teams with approval system
- **Player Profiles**: View all participants and their teams
- **Team Dashboard**: Manage your team and members

### 👑 For Team Leaders

- **Member Management**: Approve/reject join requests
- **Team Settings**: Edit team name, description, and details
- **Member Removal**: Remove inactive team members
- **Team Code Sharing**: Share unique team codes

### 🛡️ For Admins (God Mode)

- **Player Management**: Full CRUD operations, bulk CSV import from Google Sheets
- **Team Management**: Complete control over all teams
- **Force Actions**: Override restrictions and approvals
- **Data Export**: Download player and team data as CSV
- **Analytics Dashboard**: View comprehensive stats

### 🎨 UI/UX Features

- **Entertaining Loading Screens**: 20+ funny messages for free-tier delays (1-2 min loads)
- **Gradient Designs**: Purple/pink theme for Spring Fiesta vibes
- **Smooth Animations**: Framer Motion powered transitions
- **Real-time Search & Filter**: Find players and teams instantly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file
echo "MONGODB_URI=your_mongodb_connection_string" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📖 Key Routes

- `/` - Landing page with event info
- `/teams` - Browse all teams
- `/teams/create` - Create new team
- `/teams/my-team` - Team dashboard
- `/players` - Public player list
- `/admin/dashboard` - Admin panel
- `/admin/players` - Player management (CSV import)
- `/admin/teams` - Team management

## 📚 Documentation

- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Complete admin features and workflows
- **[GOOGLE_SHEETS_IMPORT.md](GOOGLE_SHEETS_IMPORT.md)** - How to import players from Google Sheets
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Database setup instructions

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS 4
- **UI**: Shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **CSV**: PapaParse

## 🎨 Key Features Implemented

### 1. Fun Loading Screens

Free tier takes 1-2+ minutes to load? No problem! We have:

- 20+ rotating funny messages
- Animated progress bars
- Icon animations
- Entertainment while waiting

### 2. Google Sheets Import

1. Export Google Sheet as CSV
2. Navigate to Admin → Players
3. Upload CSV file
4. Automatic duplicate detection
5. Bulk import hundreds of players

### 3. Join Request System

- Players request to join teams
- Leaders approve/reject in team dashboard
- Admins can force-approve
- Automatic team size limits (max 5)

### 4. Admin God Mode

Complete control panel:

- Create/edit/delete players
- Force-add to teams
- Change team leaders
- Approve all join requests
- Export all data

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `MONGODB_URI` environment variable
4. Deploy!

## 🐛 Troubleshooting

**Slow loading?**  
Normal on free tier! Loading screens keep it fun. Upgrade for instant loads.

**CSV import failed?**  
Check format: Must have `email` and `name` columns. See [GOOGLE_SHEETS_IMPORT.md](GOOGLE_SHEETS_IMPORT.md)

**Can't connect to MongoDB?**  
Verify `MONGODB_URI` in `.env.local` and check IP whitelist in MongoDB Atlas.

## 📄 License

MIT License - Feel free to use for your events!

---

**Made with ❤️ for IIIT Surat Spring Fiesta 2026**

🎭 Unite. Compete. Celebrate. 🎉

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
