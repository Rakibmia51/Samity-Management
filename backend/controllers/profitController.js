const InvestmentEndpoint = require('../models/endPoint');
const Project = require('../models/project');
const ProfitRecord = require('../models/ProfitRecord');
const ShareIssue = require('../models/shareIssue');
const shareSale = require('../models/shareSale');

// ১. ড্রপডাউন থেকে প্রোজেক্ট সিলেক্ট করলে রিয়েল-টাইম সামারি দেখানো
const getProjectSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { date } = req.query; // ফ্রন্টএন্ড থেকে কুয়েরি হিসেবে আসবে (e.g., ?date=2024-04-01)

        const selectedDate = date ? new Date(date) : new Date();
        const month = selectedDate.getMonth(); // ০ থেকে ১১
        const year = selectedDate.getFullYear();

        // ১. ওই নির্দিষ্ট মাসের শুরু এবং শেষ সময় নির্ধারণ
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

        // ২. প্রোজেক্ট ইনফো আনা (শেয়ার সংখ্যা পাওয়ার জন্য)
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // ৩. নির্দিষ্ট মাসের লেনদেন ফিল্টার করা
        const transactions = await InvestmentEndpoint.find({ 
            projectId, 
            date: { $gte: startOfMonth, $lte: endOfMonth } 
        });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(item => {
            if (item.type.toLowerCase() === 'income') totalIncome += item.amount;
            if (item.type.toLowerCase() === 'expense') totalExpenses += item.amount;
        });

        const shareSold = await shareSale.find({ projectId: projectId })

        // যেহেতু find() একটি অ্যারে দেয়, তাই আমাদের লুপ চালিয়ে সব quantity যোগ করতে হবে
        const totalActiveShares = shareSold.reduce((sum, item) => {
            return sum + (item.quantity || 0); 
        }, 0);

        // console.log(totalActiveShares);


        const netProfit = totalIncome - totalExpenses;
        // const totalActiveShares = shareSold.soldQuantity || 0;
        const profitPerShare = totalActiveShares > 0 ? (netProfit / totalActiveShares) : 0;

        res.status(200).json({
            success: true,
            data: {
                projectName: project.projectName,
                month: month + 1, // ইউজার ফ্রেন্ডলি ১-১২ ফরম্যাট
                year,
                totalIncome,
                totalExpenses,
                netProfit,
                totalActiveShares,
                profitPerShare: profitPerShare.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ২. ক্যালকুলেশনটি ডাটাবেজে রেকর্ড হিসেবে সেভ করা
const calculateAndSaveMonthlyProfit = async (req, res) => {
    try {
        const { projectId, calculationDate, notes } = req.body;
        
        // তারিখ থেকে মাস এবং বছর বের করা
        const date = new Date(calculationDate);
        const month = date.getMonth() + 1; // JS এ মাস ০ থেকে শুরু হয়
        const year = date.getFullYear();

        // ১. চেক করা ওই মাসে অলরেডি ক্যালকুলেশন সেভ হয়েছে কি না
        const existingRecord = await ProfitRecord.findOne({ projectId, month, year });
        if (existingRecord) {
            return res.status(400).json({ 
                success: false, 
                message: `Profit for ${month}/${year} has already been calculated and saved!` 
            });
        }

        //  অটো-জেনারেটেড কোড তৈরি (PRF-0001 ফরম্যাট)
        const lastRecord = await ProfitRecord.findOne().sort({ createdAt: -1 });
        let newCode = "PRF-0001"; // ডিফল্ট কোড

        if (lastRecord && lastRecord.profitCode) {
            // শেষ কোড থেকে নাম্বার বের করা (যেমন PRF-0003 থেকে ৩ বের করা)
            const lastNumber = parseInt(lastRecord.profitCode.split('-')[1]);
            const nextNumber = lastNumber + 1;
            // নাম্বারকে ৪ ডিজিটে রূপান্তর করা (0004)
            newCode = `PRF-${nextNumber.toString().padStart(4, '0')}`;
        }

        // ২. নির্দিষ্ট ওই মাসের ইনকাম এবং এক্সপেন্স বের করা
        // মাসের শুরু এবং শেষ তারিখ ঠিক করা
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const transactions = await InvestmentEndpoint.find({ 
            projectId, 
            date: { $gte: startOfMonth, $lte: endOfMonth } 
        });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(item => {
            if (item.type.toLowerCase() === 'income') totalIncome += item.amount;
            if (item.type.toLowerCase() === 'expense') totalExpenses += item.amount;
        });

        const netProfit = totalIncome - totalExpenses;

        // ৩. প্রোজেক্ট থেকে শেয়ার তথ্য আনা
        const project = await shareSale.find({ projectId: projectId });
       // সব ইস্যুর totalQuantity যোগ করা
        const totalShares = project.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const profitPerShare = totalShares > 0 ? (netProfit / totalShares) : 0;

        // ৪. রেকর্ড সেভ করা
        const newRecord = new ProfitRecord({
            profitCode: newCode, // নতুন কোড যোগ করা হলো
            projectId,
            month,
            year,
            totalIncome,
            totalExpenses,
            netProfit,
            totalShares,
            profitPerShare: parseFloat(profitPerShare.toFixed(2)),
            calculationDate: date,
            notes
        });

        await newRecord.save();

        res.status(201).json({
            success: true,
            message: "Monthly profit calculated and locked successfully.",
            data: newRecord
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const updateProfitStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Approved বা Disbursed আসবে

        const updatedRecord = await ProfitRecord.findByIdAndUpdate(
            id, 
            { status }, 
            { returnDocument: 'after' }
        );

        res.status(200).json({ success: true, data: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// ৩. সব প্রফিট ক্যালকুলেশন হিস্ট্রি দেখা
const getProfitHistory = async (req, res) => {
    try {
        const history = await ProfitRecord.find()
            .populate('projectId', 'projectName')
            .sort({createdAt: -1 }); // তারিখের পাশাপাশি বছর ও মাস দিয়ে সর্ট করা আরও নিখুঁত
            
        // যদি হিস্ট্রি খালি থাকে তবে একটি মেসেজসহ পাঠানো ভালো
        if (!history || history.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No history found" });
        }

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getProfitDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await ProfitRecord.findById(id).populate('projectId');
        
        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




module.exports = {getProfitDetails, getProfitHistory, calculateAndSaveMonthlyProfit, getProjectSummary, updateProfitStatus}