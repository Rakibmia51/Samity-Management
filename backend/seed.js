const bcrypt = require('bcrypt')
const User = require('./models/user')

const seedAdmin = async () => {
    try {
        // ১. আগে চেক করা হচ্ছে এই ইমেইলের কোনো এডমিন অলরেডি আছে কিনা
        const adminExists = await User.findOne({ email: "admin1@example.com" })
        
        if (adminExists) {
            console.log("ℹ️ Admin user already exists. Skipping seeding.")
            return // অলরেডি থাকলে নতুন করে তৈরি না করে ফাংশন থেকে বের হয়ে যাবে
        }

        // ২. পাসওয়ার্ড হ্যাশ করা
        const password = await bcrypt.hash("123456", 10)

        // ৩. নতুন এডমিন তৈরি
        await User.create({
            fullName: "admin-1",
            mobile: "01712345678", 
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
            password: password, 

            // Files (URLs)
            memberPhoto: "",
            nidCopy: "",
            signature: "",

            remarks: "Verified by local board member."
        })

        console.log("✅ Admin User Created Successfully")
    } catch (error) {
        console.error("❌ Error seeding admin user:", error)
        // এখানে process.exit() দেওয়া যাবে না, দিলে মেইন সার্ভার বন্ধ হয়ে যাবে
    }
}

// শুধু ফাংশনের রেফারেন্স এক্সপোর্ট করা হলো (ব্র্যাকেট ছাড়া)
module.exports = seedAdmin
