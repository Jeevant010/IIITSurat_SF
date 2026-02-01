# 🚀 Quick Start Guide - IIIT Surat SF 2026

## Get Your Event Running in 10 Minutes!

### Step 1: Setup (2 minutes)

```bash
# Navigate to project folder
cd fold

# Install dependencies
npm install

# Create environment file
echo "MONGODB_URI=your_connection_string_here" > .env.local
```

### Step 2: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

### Step 3: Initial Admin Setup (3 minutes)

1. **Create First Admin User**
   - The app uses mock authentication for development
   - Default test user is already in the code
   - In production, replace with real auth (Clerk, Auth.js, etc.)

2. **Import Players**
   - Go to http://localhost:3000/admin/players
   - Click "Import CSV"
   - Upload your player list (see example below)

### Step 4: Test the Flow (4 minutes)

1. **Browse Landing Page**: http://localhost:3000
2. **Create a Team**: http://localhost:3000/teams/create
3. **Browse Teams**: http://localhost:3000/teams
4. **View Players**: http://localhost:3000/players
5. **Admin Panel**: http://localhost:3000/admin/dashboard

## 📋 Example CSV for Import

Create a file called `players.csv`:

```csv
email,name,rollNumber,ign
john@iiitsurat.ac.in,John Doe,2023001,JohnnyG
jane@iiitsurat.ac.in,Jane Smith,2023002,JaneW
mike@iiitsurat.ac.in,Mike Johnson,2023003,MikeK
sarah@iiitsurat.ac.in,Sarah Davis,2023004,SarahD
```

## 🎯 What's Working Out of the Box

✅ Team creation and management  
✅ Join request system  
✅ Player browsing  
✅ Admin controls  
✅ CSV import  
✅ Fun loading screens  
✅ Responsive design

## 🔧 Configuration Options

### Change Team Size Limit

File: `app/actions/admin-actions.ts`

```typescript
if (memberCount >= 5) {
  // Change 5 to your desired limit
  return { success: false, message: "Team is full" };
}
```

### Customize Loading Messages

File: `components/loading-screen.tsx`

```typescript
const funnyMessages = [
  "Your custom message...",
  // Add more!
];
```

### Update Event Branding

File: `app/page.tsx` - Change headings, descriptions, colors

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - MONGODB_URI
```

### Option 2: Docker

```bash
# Build image
docker build -t sf2026 .

# Run container
docker run -p 3000:3000 -e MONGODB_URI=your_uri sf2026
```

## 🎨 Customization Quick Wins

### 1. Change Theme Colors

File: `app/globals.css`

```css
:root {
  --primary: 270 91% 65%; /* Purple - change these HSL values */
  --secondary: 340 82% 67%; /* Pink */
}
```

### 2. Update Event Name

Search and replace "Spring Fiesta 2026" with your event name across:

- `app/page.tsx`
- `components/loading-screen.tsx`
- `README.md`

### 3. Add Your Logo

1. Add logo to `public/logo.png`
2. Update `app/page.tsx` header section

## 📱 Mobile Testing

```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from phone on same network
http://YOUR_IP:3000
```

## 🐛 Common Issues

### "Cannot connect to database"

**Fix**:

1. Check `MONGODB_URI` in `.env.local`
2. Whitelist your IP in MongoDB Atlas
3. Try: `mongodb://localhost:27017/sf2026` for local MongoDB

### "Module not found"

**Fix**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Page loads forever

**Fix**: This is normal on free MongoDB tier (cold start). Loading screens make it fun!

## 📊 Testing Data

Want to test with dummy data?

```bash
# Create some test players
curl -X POST http://localhost:3000/api/test-data
```

Or manually via Admin Panel:

1. Go to `/admin/players`
2. Click "Add Player"
3. Fill details manually

## 🎯 Next Steps

1. ✅ Import your real player list
2. ✅ Customize branding and colors
3. ✅ Test team creation flow
4. ✅ Test join request approval
5. ✅ Deploy to Vercel
6. ✅ Share with participants!

## 💡 Pro Tips

- **Free Tier is OK**: Loading screens handle delays entertainingly
- **Export Regularly**: Use admin CSV export as backup
- **Monitor Requests**: Check pending join requests daily
- **Let Users Self-Serve**: Only intervene as admin when needed

## 🆘 Need Help?

1. Check [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for detailed features
2. See [GOOGLE_SHEETS_IMPORT.md](GOOGLE_SHEETS_IMPORT.md) for import issues
3. Read [MONGODB_SETUP.md](MONGODB_SETUP.md) for database help

## 🎉 You're Ready!

Your Spring Fiesta 2026 platform is ready to rock!

Share these links with participants:

- **Landing**: `yoursite.com`
- **Browse Teams**: `yoursite.com/teams`
- **View Players**: `yoursite.com/players`

Admin link (keep private):

- **Admin Dashboard**: `yoursite.com/admin/dashboard`

---

**Have fun managing your event! 🎭**
