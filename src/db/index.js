
import mongoose from 'mongoose'
import { db_name } from "../../constants.js"

const dbConnect=async ()=>{
    try {
        // console.log(`${process.env.MONGODB_URI}`)
        const dbInstance=await mongoose.connect( `${process.env.MONGODB_URI}/${db_name}`
            //  ||`${ process.env.MONGODB_URI}/${db_name}`
            )
        console.log("connected to database")
    } catch (error) {
        throw error
    }
}

export { dbConnect }
