const ShareSale = require('../models/shareSale');
const ShareIssue = require('../models/shareIssue');

// শেয়ার সেল ক্রিয়েট করা
const createShareSale = async (req, res) => {
    try {
        const { projectId, quantity, issueId, pricePerShare } = req.body;

        // ১. এভেইলেবল শেয়ার চেক (totalQuantity - soldQuantity)
        const issue = await ShareIssue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ success: false, message: "Share Issue not found!" });
        }

        const available = issue.totalQuantity - (issue.soldQuantity || 0);
        if (available < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `যথেষ্ট শেয়ার নেই! বর্তমানে ${available} টি শেয়ার বিক্রির জন্য আছে।` 
            });
        }

        // ২. অটো সেল নম্বর জেনারেট করা
        const lastSale = await ShareSale.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;
        if (lastSale?.saleNumber) {
            nextNumber = parseInt(lastSale.saleNumber.split('-')[1]) + 1;
        }
        const formattedNumber = `SLS-${nextNumber.toString().padStart(4, '0')}`;

        // ৩. নতুন সেল তৈরি
        const newSale = new ShareSale({
            ...req.body,
            saleNumber: formattedNumber,
            totalAmount: Number(quantity) * Number(pricePerShare),
            soldBy: req.user.id 
        });

        // ৪. [গুরুত্বপূর্ণ পরিবর্তন] totalQuantity কমবে না, soldQuantity বাড়বে
        await ShareIssue.findByIdAndUpdate(issueId, {
            $inc: { soldQuantity: Number(quantity) }
        });

        await newSale.save();
        res.status(201).json({ 
            success: true, 
            message: "Share sale recorded successfully", 
            data: newSale 
        });

    } catch (error) {
        console.error(error); // সার্ভার এরর চেক করার জন্য
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllShareSales = async (req, res) => {
    try {
        const shareSales = await ShareSale.find()
            .populate('projectId', 'projectName projectCode') // Get project name
            .populate('userId', 'fullName memberCode') // Get member details
            .populate('soldBy', 'fullName memberCode email') // Populating Admin Name
            .sort({ createdAt: -1 }); // Newest first


  // ২. সব ডাটা থেকে ইনকাম এবং এক্সপেন্স এর মোট যোগফল বের করা
        const overallTotals = shareSales.reduce((acc, curr) => {
            if (curr.totalAmount) acc.totalAmount += curr.totalAmount;
            if(curr.quantity) acc.quantity += curr.quantity;
            return acc;
        }, { totalAmount: 0, quantity: 0});

        res.status(200).json({
            success: true,
            count: shareSales.length,
            overallTotals: {
                totalShareSales: overallTotals.totalAmount,
                totalShareQty : overallTotals.quantity
            },
            shareSales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





module.exports = {createShareSale, getAllShareSales}