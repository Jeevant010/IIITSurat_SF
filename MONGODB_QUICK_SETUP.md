# 🗄️ MongoDB Setup Guide

## Quick Start Options

You have 3 options to get MongoDB running:

---

## Option 1: Local MongoDB (Fastest for Development)

### Windows Installation:

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, Latest version, MSI
   - Download and run the installer

2. **Install with Default Settings**
   - Accept license
   - Choose "Complete" installation
   - Install "MongoDB as a Service" (checked by default)
   - Install MongoDB Compass (GUI tool) - optional but recommended

3. **Verify Installation**

   ```powershell
   # Check if MongoDB is running
   Get-Service MongoDB

   # Should show "Running"
   ```

4. **Update .env.local**

   ```env
   MONGODB_URI=mongodb://localhost:27017/IIITSurat_SF
   ```

5. **Restart your dev server**
   ```bash
   npm run dev
   ```

---

## Option 2: MongoDB Atlas Free Tier (Cloud, No Installation)

### Setup Steps:

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google

2. **Create Free Cluster**
   - Click "Build a Database"
   - Select "M0 FREE" tier
   - Choose a region close to you (e.g., Mumbai for India)
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Atlas Admin"
   - Click "Add User"

4. **Whitelist Your IP**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your current IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `IIITSurat_SF`

6. **Update .env.local**

   ```env
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/IIITSurat_SF?retryWrites=true&w=majority
   ```

7. **Restart dev server**
   ```bash
   npm run dev
   ```

---

## Option 3: Use Docker (For Developers)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/IIITSurat_SF

# Restart dev server
npm run dev
```

---

## Current Setup

Your `.env.local` is currently set to use **local MongoDB**.

To switch:

1. Install MongoDB using Option 1 above
2. OR update `.env.local` with Atlas connection string (Option 2)

---

## Testing Your Connection

After setup, test if MongoDB is working:

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000

3. If you see the landing page without errors → ✅ Working!

4. Try creating a team at: http://localhost:3000/teams/create

---

## Troubleshooting

### Error: "ECONNREFUSED"

- MongoDB service is not running
- **Fix**: Start MongoDB service or check if it's installed

### Error: "Authentication failed"

- Wrong username/password in Atlas
- **Fix**: Double-check credentials in connection string

### Error: "IP not whitelisted"

- Your IP is not allowed in Atlas
- **Fix**: Add your IP in Network Access (or allow all: 0.0.0.0/0)

### Error: "Cannot find module 'mongodb'"

- Missing dependencies
- **Fix**: `npm install`

---

## Recommended: Option 1 for Quick Testing

For immediate development:

1. Install MongoDB locally (10 minutes)
2. Use: `mongodb://localhost:27017/IIITSurat_SF`
3. No signup, no network issues, fast!

For production deployment:

1. Use MongoDB Atlas (Option 2)
2. Better for Vercel/cloud deployments
3. Free tier is sufficient for small events

---

## Next Steps After Setup

Once MongoDB is connected:

1. **Import Players**: Go to `/admin/players` and upload CSV
2. **Create Teams**: Test at `/teams/create`
3. **Test Features**: Try all admin functions

---

Need help? Check the error message and match it with troubleshooting above!
