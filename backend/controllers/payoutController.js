const ProfitPayout = require("../models/profitPayout"); 
const ProfitRecord = require("../models/profitRecord"); 

// ১. প্রফিট ডিস্ট্রিবিউট করার ফাংশন
const distributeMemberProfits = async (req, res) => { 
    try { 
        const { payouts, profitRecordId } = req.body; 

        // চেক করা যে এই ক্যালকুলেশনটি আগে ডিস্ট্রিবিউট হয়েছে কিনা 
        const existing = await ProfitPayout.findOne({ profitRecordId }); 
        if (existing) { 
            return res.status(400).json({ message: "Profit already distributed for this record!" }); 
        } 

        // Bulk Insert (একসাথে সবার ডাটা সেভ) 
        await ProfitPayout.insertMany(payouts); 

        // মেইন প্রফিট রেকর্ডের স্ট্যাটাস আপডেট 
        await ProfitRecord.findByIdAndUpdate(profitRecordId, { status: 'Distributed' }); 

        res.status(200).json({ success: true, message: "Profits distributed successfully!" }); 
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    } 
}; 

// ২. ডিস্ট্রিবিউটেড প্রফিট গেট করার ফাংশন (যা আগে ভুল ছিল, এখন ফিক্সড)
const getDistributeMemberProfits = async (req, res) => { 
    try { 
        // ভেরিয়েবলের নাম পরিবর্তন করে profitPayouts করা হয়েছে যেন মডেল নামের সাথে কনফ্লিক্ট না করে
        const profitPayouts = await ProfitPayout.find() 
            .populate('projectId', 'projectName') 
            .sort({ createdAt: -1 }); 

        res.status(200).json({ success: true, data: profitPayouts }); 
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    } 
}; 

module.exports = { distributeMemberProfits, getDistributeMemberProfits };
