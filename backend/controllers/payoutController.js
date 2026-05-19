const ProfitPayout = require("../models/ProfitPayout");
const profitRecord = require("../models/ProfitRecord");


const distributeMemberProfits = async (req, res) => {
    try {
        const { payouts, profitRecordId } = req.body;

        // ১. চেক করা যে এই ক্যালকুলেশনটি আগে ডিস্ট্রিবিউট হয়েছে কিনা
        const existing = await ProfitPayout.findOne({ profitRecordId });
        if (existing) {
            return res.status(400).json({ message: "Profit already distributed for this record!" });
        }

        // ২. Bulk Insert (একসাথে সবার ডাটা সেভ)
        await ProfitPayout.insertMany(payouts);

        // ৩. মেইন প্রফিট রেকর্ডের স্ট্যাটাস আপডেট
        await profitRecord.findByIdAndUpdate(profitRecordId, { status: 'Distributed' });

        res.status(200).json({ success: true, message: "Profits distributed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDistributeMemberProfits = async (req, res) =>{
    try {
        const profitPayout = await ProfitPayout.find()
            .populate('projectId', 'projectName')
            .sort({createdAt: -1})

        res.status(200).json({ success: true, data: profitPayout });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {distributeMemberProfits, getDistributeMemberProfits}