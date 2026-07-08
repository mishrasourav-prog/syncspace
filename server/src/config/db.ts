import mongoose from "mongoose";

export const connectDb = async() : Promise<void> =>{
    try{
        const conn = await mongoose.connect(process.env.URI || '');
        console.log(conn);
    }
    catch(error){
        process.exit(1);

    }
}