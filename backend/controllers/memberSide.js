// For Member Frontend
const ShareSale = require('../models/shareSale');
const ShareIssue = require('../models/shareIssue');
const ProfitPayout = require("../models/ProfitPayout"); // মডেলটি ইমপোর্ট নিশ্চিত করুন

const getMyShareStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // ১. শেয়ার সেল থেকে ইনভেস্টমেন্ট এবং শেয়ার সংখ্যা বের করা
        const mySales = await ShareSale.find({ userId });
        
        let totalInvestment = 0;
        let totalShares = 0;
        let uniqueProjects = new Set();

        mySales.forEach(sale => {
            totalInvestment += (sale.totalAmount || 0);
            totalShares += (sale.quantity || 0);
            if(sale.projectId) uniqueProjects.add(sale.projectId.toString());
        });

        // ২. প্রফিট পে-আউট টেবিল থেকে Ledger Balance (মোট প্রফিট) বের করা
        // আপনার ডাটা অনুযায়ী মেম্বার আইডি ফিল্ডের নাম 'memberId'
        const myProfits = await ProfitPayout.find({ memberId: userId });
        
        const ledgerBalance = myProfits.reduce((acc, curr) => {
            return acc + (curr.totalProfitAmount || 0);
        }, 0);

        // ৩. রেসপন্স পাঠানো
        res.status(200).json({
            success: true,
            data: {
                totalInvestment,
                totalShares,
                projectsInvested: uniqueProjects.size,
                ledgerBalance: ledgerBalance // এটাই আপনার মেম্বারের মোট প্রফিট
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




module.exports ={getMyShareStats}