# 📋 Deployment Checklist - SF 2026

## Pre-Deployment

### Local Testing

- [ ] Run `npm run dev` successfully
- [ ] Test team creation flow
- [ ] Test join request flow
- [ ] Test CSV import with sample data
- [ ] Test admin player management
- [ ] Test admin team management
- [ ] Test on mobile device
- [ ] Test loading screens appear
- [ ] Test all navigation links

### Database Setup

- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with password
- [ ] IP whitelist configured (0.0.0.0/0 for all IPs or specific)
- [ ] Connection string copied
- [ ] Test connection from local environment

### Environment Variables

- [ ] `.env.local` created locally
- [ ] `MONGODB_URI` set and tested
- [ ] Build runs without errors: `npm run build`

## Deployment Steps

### Option 1: Vercel (Recommended)

#### Step 1: Prepare Code

- [ ] Commit all changes to git
- [ ] Push to GitHub/GitLab/Bitbucket
- [ ] Ensure `package.json` has correct scripts

#### Step 2: Vercel Setup

- [ ] Create account at [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import your repository
- [ ] Configure project:
  - Framework Preset: Next.js
  - Root Directory: `fold` (if repo has multiple folders)
  - Build Command: `npm run build`
  - Output Directory: `.next`

#### Step 3: Environment Variables

- [ ] In Vercel project settings → Environment Variables
- [ ] Add: `MONGODB_URI` = `your_connection_string`
- [ ] Add to: Production, Preview, Development
- [ ] Click "Save"

#### Step 4: Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Visit deployed URL

#### Step 5: Verify

- [ ] Landing page loads
- [ ] Loading screen appears and completes
- [ ] Navigation works
- [ ] Admin panel accessible
- [ ] Database connection works
- [ ] Can create teams
- [ ] Can import players

### Option 2: Other Platforms

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables
railway variables set MONGODB_URI="your_uri"

# Deploy
railway up
```

#### Render

1. Connect repository
2. Select "Web Service"
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variable: `MONGODB_URI`
6. Deploy

#### DigitalOcean App Platform

1. Create new app
2. Connect repository
3. Detect Next.js automatically
4. Add environment variables
5. Deploy

## Post-Deployment

### Testing Production

- [ ] Visit production URL
- [ ] Test team creation
- [ ] Test CSV import
- [ ] Test join requests
- [ ] Test admin features
- [ ] Check loading screens
- [ ] Test on mobile browser
- [ ] Test across different browsers

### Performance Check

- [ ] Run Lighthouse audit
- [ ] Check page load times
- [ ] Monitor MongoDB usage
- [ ] Check error logs

### Configuration

- [ ] Set up custom domain (optional)
- [ ] Configure SSL (auto on Vercel)
- [ ] Set up monitoring (optional)
- [ ] Configure error tracking (optional)

## Data Preparation

### Before Event Launch

- [ ] Import initial player list via CSV
- [ ] Create test teams for verification
- [ ] Delete test data
- [ ] Export empty database as backup

### Go-Live Checklist

- [ ] All players imported
- [ ] Admin access verified
- [ ] Landing page updated with event details
- [ ] Links shared with participants
- [ ] Support contact info added

## URLs to Share

After deployment, share these with participants:

```
🏠 Main Site: https://your-site.vercel.app
👥 Browse Teams: https://your-site.vercel.app/teams
➕ Create Team: https://your-site.vercel.app/teams/create
👤 View Players: https://your-site.vercel.app/players
🏆 Leaderboard: https://your-site.vercel.app/leaderboard
```

Admin URL (keep private):

```
🛡️ Admin Dashboard: https://your-site.vercel.app/admin/dashboard
```

## Monitoring

### Check Regularly

- [ ] Pending join requests
- [ ] New teams created
- [ ] Player count
- [ ] Error logs in Vercel dashboard
- [ ] MongoDB usage metrics

### Backup Strategy

- [ ] Export player data weekly
- [ ] Export team data before event
- [ ] Keep CSV backups
- [ ] Document database state

## Troubleshooting Production

### If site is slow:

1. Check MongoDB Atlas metrics
2. Verify Vercel function logs
3. Consider upgrading free tier
4. Remember: Loading screens handle this!

### If imports fail:

1. Check CSV format
2. Verify MongoDB connection
3. Check Vercel function timeout
4. Import in smaller batches

### If database errors:

1. Check connection string
2. Verify IP whitelist
3. Check user permissions
4. Test connection locally

## Scaling for Large Events

### If expecting 500+ participants:

- [ ] Consider MongoDB shared cluster ($9/month)
- [ ] Consider Vercel Pro for better performance
- [ ] Enable MongoDB connection pooling
- [ ] Add indexes to database
- [ ] Monitor response times

### Database Indexes

Add in MongoDB Atlas:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ teamId: 1 });

// Teams collection
db.teams.createIndex({ teamCode: 1 }, { unique: true });
db.teams.createIndex({ name: 1 }, { unique: true });
```

## Security Checklist

- [ ] Environment variables not in code
- [ ] `.env.local` in `.gitignore`
- [ ] MongoDB credentials secure
- [ ] No API keys exposed
- [ ] Admin routes properly protected (add auth in production)

## Future Improvements

Consider adding later:

- [ ] Real authentication (Clerk, Auth.js)
- [ ] Email notifications for join requests
- [ ] Team chat/messaging
- [ ] File uploads for team logos
- [ ] Event schedule integration
- [ ] Real-time leaderboard updates
- [ ] Payment integration (if needed)

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- Project ADMIN_GUIDE.md
- Project QUICK_START.md

## Emergency Contacts

Add your team contacts:

```
Technical Admin: [email/phone]
Database Admin: [email/phone]
Event Coordinator: [email/phone]
```

---

## Final Checklist

Before announcing to participants:

- [ ] Site is live and accessible
- [ ] All features tested
- [ ] Players imported
- [ ] Documentation updated
- [ ] Support system ready
- [ ] Backup plan in place
- [ ] Team ready to help users

---

**You're ready to launch Spring Fiesta 2026! 🎉**

Good luck with your event! 🎭
