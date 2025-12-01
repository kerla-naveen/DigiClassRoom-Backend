
import mongoose from 'mongoose'
import { db_name } from "../../constants.js"

const dbConnect=async ()=>{
    try {
        // console.log(`${process.env.MONGODB_URI}`)
        const dbInstance=await mongoose.connect( `mongodb://127.0.0.1:27017/${db_name}`
            //  ||`${ process.env.MONGODB_URI}/${db_name}`
            )
    } catch (error) {
        throw error
    }
}

export { dbConnect }
