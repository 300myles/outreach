import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set. Please add it to your .env.local file.")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose
      })
      .catch((err) => {
        console.error("[v0] MongoDB connection error:", err)
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { mongoose }

// Deprecated: sql function no longer exists - use connectDB() and mongoose models instead
export const sql = () => {
  throw new Error(
    "The sql() function is deprecated. This application now uses MongoDB. Please use connectDB() and mongoose models instead. See lib/models.ts for available models.",
  )
}
