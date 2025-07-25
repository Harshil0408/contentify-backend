import mongoose from 'mongoose'
import { DB_NAME } from '../constants/index.ts'

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("MONGODB conenction error", error)
        process.exit(1)
    }
}

export default connectDB