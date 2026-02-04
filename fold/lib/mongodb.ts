import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const cached: CachedConnection = (global.mongoose as CachedConnection) || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached as any;
}

async function connectDB(retries = 3): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  let attempt = 0;
  while (attempt < retries) {
    try {
      cached.conn = await cached.promise;
      console.log("✅ MongoDB connected successfully");
      return cached.conn;
    } catch (e) {
      attempt++;
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, e);
      
      if (attempt >= retries) {
        cached.promise = null;
        cached.conn = null;
        throw new Error(
          `MongoDB connection failed after ${retries} attempts. Please check your MONGODB_URI and network connection.`
        );
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      
      // Reset the promise for retry
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        retryReads: true,
      });
    }
  }

  return cached.conn!;
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (cached.conn) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
    }
    process.exit(0);
  });
}

export default connectDB;
