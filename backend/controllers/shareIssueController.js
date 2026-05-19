const Projects = require('../models/project');
const ShareIssue = require('../models/shareIssue');
const shareSale = require('../models/shareSale');



const createShareIssue = async (req, res) => {
  try {
    // ১. সবশেষ ইস্যু খুঁজে বের করা
    const lastIssue = await ShareIssue.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastIssue && lastIssue.issueNumber) {
      const lastNum = parseInt(lastIssue.issueNumber.split('-')[1]);
      nextNumber = lastNum + 1;
    }

    const formattedNumber = `ISS-${nextNumber.toString().padStart(4, '0')}`;

    // ২. ডেটা সেভ করা
    const newIssue = new ShareIssue({
      ...req.body,
      issueNumber: formattedNumber,
      totalValue: req.body.totalQuantity * req.body.pricePerShare
    });

    await newIssue.save();
    res.status(201).json({ success: true, message: "Share Issued successfully", data: newIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getShareIssues = async (req, res) => {
    try {
        // populate('projectId', 'projectName') ব্যবহার করা হয়েছে যাতে প্রজেক্টের নামও পাওয়া যায়
        const shares = await ShareIssue.find()
            .populate('projectId', 'projectName') 
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: shares.length,
            shares: shares
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const singleShareIssue = async (req, res) => {
    try {
        const share = await ShareIssue.findById(req.params.id).populate('projectId', 'projectName');
        
        if (!share) {
            return res.status(404).json({
                success: false,
                message: "Share Issue record not found"
            });
        }

        return res.status(200).json({
            success: true,
            share: share
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// শেয়ার ইস্যু আপডেট করা
const updateShareIssue = async (req, res) => {
    try {
        const { totalQuantity, pricePerShare } = req.body;
        const totalValue = totalQuantity * pricePerShare;

        const updatedIssue = await ShareIssue.findByIdAndUpdate(
            req.params.id,
            { ...req.body, totalValue },
            {returnDocument: 'after'}
        );

        res.status(200).json({ success: true, message: "Updated successfully", data: updatedIssue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const deleteShareIssue = async (req, res) => {
    try {
        const { id } = req.params; // এটি Share Issue এর _id

        // ১. প্রথমে Share Issue রেকর্ডটি খুঁজুন
        const issue = await ShareIssue.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Share Issue not found!"
            });
        }

        // ২. চেক করুন এই প্রোজেক্টের কোনো শেয়ার বিক্রি (Sale) হয়েছে কি না
        // আপনার Share Sale ডাটাতে projectId ফিল্ডটি আছে, তাই আমরা এটি ব্যবহার করছি
        const hasSales = await shareSale.findOne({ projectId: issue.projectId });

        if (hasSales) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete! Members have already purchased shares from this project's issuance."
            });
        }

        // ৩. যদি কোনো সেল না থাকে, তবে ডিলিট করুন
        await ShareIssue.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Share Issuance deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





const getLatestPrice = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const latestIssue = await ShareIssue.findOne({ projectId: projectId })
            .sort({ createdAt: -1 });

        if (latestIssue) {
            // ক্যালকুলেশন: মোট শেয়ার থেকে বিক্রি হওয়া শেয়ার বাদ দিন
            const available = latestIssue.totalQuantity - (latestIssue.soldQuantity || 0);
           
            res.json({ 
                success: true, 
                totalQuantity: latestIssue.totalQuantity,
                price: latestIssue.pricePerShare, 
                totalValue: latestIssue.totalValue,
                soldQuantity: latestIssue.soldQuantity,
                availableShares: available, // এখন এটি আপডেট করা সংখ্যা পাঠাবে
                issueId: latestIssue._id 
            });
        } else {
            res.status(404).json({ success: false, message: "No stock found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getShareIssuesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // নির্দিষ্ট প্রোজেক্টের সব শেয়ার সেল এবং ইউজারের (ইনভেস্টর) তথ্য আনা
        const shares = await shareSale.find({ projectId: projectId })
            .populate('userId', 'fullName email mobile'); // User মডেলের ফিল্ড অনুযায়ী (name বা username)

        if (!shares || shares.length === 0) {
            return res.status(200).json([]); // ইনভেস্টর না থাকলে ফাঁকা অ্যারে
        }

        res.status(200).json(shares);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports ={getShareIssuesByProject, createShareIssue,getLatestPrice, getShareIssues, singleShareIssue, updateShareIssue, deleteShareIssue}