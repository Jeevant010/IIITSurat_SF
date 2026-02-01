# MongoDB Setup Guide

## Installation & Configuration

### 1. MongoDB Installation Options

#### Option A: Local MongoDB

```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey on Windows:
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (Free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### 2. Environment Configuration

Update `.env.local` with your MongoDB connection string:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/springfiesta

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/springfiesta?retryWrites=true&w=majority
```

### 3. Database Schema

The application uses Mongoose with the following models:

#### User Model

- `email`: String (unique)
- `name`: String
- `role`: "USER" | "ADMIN"
- `teamId`: Reference to Team
- `rollNumber`: String (optional)
- `ign`: String (optional, In-Game Name)

#### Team Model

- `name`: String (unique)
- `teamCode`: String (unique)
- `leaderId`: Reference to User

#### JoinRequest Model

- `userId`: Reference to User
- `teamId`: Reference to Team
- `status`: "PENDING" | "ACCEPTED" | "REJECTED"

### 4. Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 5. Testing the Database Connection

The app will automatically connect to MongoDB when you access any page. Check the console for connection logs.

## Migrating from Prisma

✅ **Completed Changes:**

- Removed `@prisma/client` and `prisma` packages
- Created Mongoose models in `lib/models/`
- Updated all database queries to use Mongoose
- Created MongoDB connection utility in `lib/mongodb.ts`

## Troubleshooting

### Connection Issues

- Ensure MongoDB is running (local) or credentials are correct (Atlas)
- Check firewall settings
- Verify network access in MongoDB Atlas

### Common Errors

- **"MongooseError: buffering timed out"** - MongoDB server not running
- **"Authentication failed"** - Check username/password in connection string
- **"ECONNREFUSED"** - MongoDB service not started

## Next Steps

1. Update `.env.local` with your MongoDB connection string
2. Start MongoDB (if using local installation)
3. Run `npm run dev`
4. The database and collections will be created automatically on first use
