const mongoose = require('mongoose')
require('dotenv').config()

const dbConnection = async ()=>{
    try {
        await mongoose.connect(process.env.DBURL);
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('Connection error:', error)
        process.exit(1)
    }
}

module.exports = dbConnection;