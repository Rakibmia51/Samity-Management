const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    memberCode: { 
    type: String, 
    unique: true, 
    uppercase: true 
    },
    fullName: { type: String, required: true, trim: true },
    mobile: { 
        type: String, 
        required: true, 
        unique: true,
        match: [/^01[3-9]\d{8}$/, 'দয়া করে সঠিক বাংলাদেশি মোবাইল নম্বর দিন'] 
    },
    email: { type: String, lowercase: true, trim: true, required: true },
    nid: { type: String, unique: true },
    dateOfBirth: { type: Date, required: true },
  
    // ২. পারিবারিক তথ্য
    fatherName: { type: String },
    motherName: { type: String},
    spouseName: { type: String },
    occupation: { type: String },
    monthlyIncome: { type: Number },

    // ৩. ঠিকানা
    presentAddress: { type: String, required: true },
    permanentAddress: { type: String, required: true },

    // ৪. নমিনি সংক্রান্ত তথ্য
    nomineeName: { type: String, required: true },
    relation: { type: String, required: true },
    nomineeMobile: { type: String },

    // ৫. এডমিশন ও রোল
    admissionDate: { type: Date, default: Date.now },
    role: { type: String, enum: ['member', 'admin', 'boardMember'], default: 'member' },
    admissionFee: { type: Number, required: true },

    // নতুন যোগ করা ফিল্ড: স্ট্যাটাস (Active/Inactive)
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
  
    // ৬. সিকিউরিটি
    password: { type: String, required: true, minlength: 6 },

    // ৭. ফাইল ও ছবি
    memberPhoto: { type: String }, 
    nidCopy: { type: String },      
    signature: { type: String },    

    remarks: { type: String }
},{timestamps: true})

const User = mongoose.model('User', userSchema);
module.exports = User;
