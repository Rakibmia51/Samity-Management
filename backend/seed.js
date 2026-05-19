const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()
const User = require('./models/user')


const seedAdmin = async ()=>{
    try {
        await mongoose.connect(process.env.DBURL);
        console.log('Database Connected')

        const password = await bcrypt.hash("123456", 10)

        await User.create({
            fullName: "admin-1",
            mobile: "01712345678", // Matches your BD regex
            email: "admin1@example.com",
            nid: "1234567890123",
            dateOfBirth: new Date("1995-05-15"),

            // Family Details
            fatherName: "Late Abdur Rahman",
            motherName: "Fatema Begum",
            spouseName: "Nasrin Akter",
            occupation: "Private Service",
            monthlyIncome: 35000,

            // Address
            presentAddress: "House 12, Road 5, Dhanmondi, Dhaka",
            permanentAddress: "Village: Sonapur, P.O: Ramganj, Lakshmipur",

            // Nominee Details
            nomineeName: "Nasrin Akter",
            relation: "Wife",
            nomineeMobile: "01812345678",

            // Admission & Roles
            admissionDate: new Date(),
            role: "admin",
            admissionFee: 500,

            // Security
            password: password, // Remember to hash this before saving!

            // Files (URLs)
            memberPhoto: "",
            nidCopy: "",
            signature: "",

            remarks: "Verified by local board member."
        })

        console.log("Admin User Created")
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

seedAdmin()