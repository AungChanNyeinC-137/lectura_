import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null,
        promise: Promise<typeof mongoose> | null
    };
}
let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        console.log("ACTUAL URI:", process.env.MONGODB_URI);
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false
        });
        try {
            cached.conn = await cached.promise;

        } catch (error) {
            cached.promise = null;
            console.error('Mongodb connection error.Please make sure mongodb is running.'+ error);
            throw error;
        }
        console.info('Successfully connected to mongodb');
        return cached.conn;


    }
}