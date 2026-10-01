import mongoose from "mongoose";

export const connectDb =  async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment variables.");
        }
        const connect = await mongoose.connect(mongoUri);
        console.log(`MongoDb connected : ${connect.connection.host} `);
    } catch (error) {
        console.log(`Error while connecting to DB`, error);   
        process.exit(1);  
    }
};