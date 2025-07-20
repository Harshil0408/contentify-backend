import dotenv from 'dotenv'
import connectDB from './configs/index.ts'
import { app } from './app.ts'


dotenv.config()

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("MONGODB CONNECTION ERROR", error)
    })