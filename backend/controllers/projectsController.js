const InvestmentEndpoint = require("../models/endPoint");
const Projects = require("../models/project");
const ShareIssue = require("../models/shareIssue");
const shareSale = require("../models/shareSale");

const createProject =async(req, res)=>{

    try {
        // ১. সবশেষ প্রজেক্টটি খুঁজে বের করা (সিরিয়াল কোডের জন্য)
        const lastProject = await Projects.findOne().sort({ createdAt: -1 });
        
        let nextNumber = 1;
        if (lastProject && lastProject.projectCode) {
        // PRJ-0001 থেকে নম্বরটি আলাদা করা
        const lastNumber = parseInt(lastProject.projectCode.split('-')[1]);
        nextNumber = lastNumber + 1;
        }

        // ২. নম্বরটিকে PRJ-0001 ফরম্যাটে রূপান্তর করা
        const formattedCode = `PRJ-${nextNumber.toString().padStart(4, '0')}`;

        // ৩. নতুন প্রজেক্ট তৈরি
        const newProject = new Projects({
        ...req.body,
        projectCode: formattedCode
        });

        await newProject.save();
        return res.status(201).json({success: true, message: 'Project Create successfully'})
       
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}


const getProjects =async(req, res)=>{
    try {
        const projects = await Projects.find()
            .sort({ createdAt: -1 });
        
        const totalProject = projects.length;
        const activeProject = projects.filter(project => project.status === 'Active').length;
        const pendingProject = projects.filter(project => project.status === 'Pending').length;

        const shareIssue = await ShareIssue.find()
                    .populate('projectId', 'totalQuantity pricePerShare totalValue')
                    .sort({ createdAt: -1 });
        
       
        const shareSales = await shareSale.find()
                    .sort({ createdAt: -1 });

        const overallTotals = shareSales.reduce((acc, curr) => {
            if (curr.totalAmount) acc.totalAmount += curr.totalAmount;
            if(curr.quantity) acc.quantity += curr.quantity;
            return acc;
        }, { totalAmount: 0, quantity: 0});


        const endPoints = await InvestmentEndpoint.find()
        .populate('projectId', 'projectName projectCode')
        .sort({ createdAt: -1 });

        const endPointTotal = endPoints.reduce((acc, curr)=>{
            if (curr.type === 'Income') acc.income += curr.amount;
            if (curr.type === 'Expense') acc.expense += curr.amount;
            return acc;
        },{ income: 0, expense: 0 })


        

        return res.status(200).json({
            success:true,
            totalProject,
            activeProject,
            pendingProject, 
            projects,
            shareIssue,
             overallTotals: {
                totalShareSales: overallTotals.totalAmount,
                totalShareQty : overallTotals.quantity
            },
            shareSales,
            endPointTotal: {
                 totalIncome: endPointTotal.income,
                totalExpense: endPointTotal.expense,
                totalProfit: endPointTotal.income - endPointTotal.expense
            },
            endPoints
        })
    } catch (error) {
       return res.status(500).json({success: false, message: error.message})
    }
}


const getProject = async(req, res)=>{
    try {
        const project = await Projects.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const projectAllDetails = async (req, res) => {
    try {
        const projects = await Projects.find().lean();
        const shareIssues = await ShareIssue.find().lean();


        const result = projects.map(project => {
            // shareIssue এর ভেতর projectId একটি অবজেক্ট, তাই ._id দিয়ে চেক করতে হবে
            const share = shareIssues.find(s => 
                s.projectId?._id?.toString() === project._id.toString() || 
                s.projectId?.toString() === project._id.toString()
            );
            return {
                ...project,
                shareDetails: share || null
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Data fetch korte somossa hoyeche",
            error: error.message
        });
    }
};


const getProjectDetailsById = async (req, res) => {
    try {
        const { id } = req.params; // ইউজার আইডি পাঠাবে URL-এ

        // ১. নির্দিষ্ট প্রজেক্ট খুঁজে বের করা
        const project = await Projects.findById(id).lean();

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project pawa jayni"
            });
        }

        // ২. এই প্রজেক্টের সাথে মিল আছে এমন ShareIssue খুঁজে বের করা
        const share = await ShareIssue.findOne({ 
            $or: [
                { "projectId": id },
                { "projectId._id": id }
            ]
        }).lean();

        // ৩. এই প্রজেক্টের অধীনে যত শেয়ার বিক্রি (Sales) হয়েছে সব আনা
        // এখানে .populate() ব্যবহার করলে মেম্বারের নাম সরাসরি পাওয়া যাবে (যদি মডেলে রেফারেন্স থাকে)
        const shareSales = await shareSale.find({ 
            $or: [
                { "projectId": id }, 
                { "projectId._id": id }
            ]
        }).populate('userId', 'fullName memberCode').lean();


        const endPoints = await InvestmentEndpoint.find({
            $or: [
                { "projectId": id }, 
                { "projectId._id": id }
            ]
        })
        .sort({ createdAt: -1})
        .populate('projectId', 'projectName')

        const totals = endPoints.reduce((acc, curr) => {
            if(curr.type === 'Income') acc.income += curr.amount;
            if(curr.type === 'Expense') acc.expense += curr.amount;

            return acc;
        }, {income: 0, expense: 0})

        // 4. প্রজেক্টের সাথে শেয়ারের তথ্য যুক্ত করা
        const result = {
            ...project,
            shareDetails: share || null,
            shareSales: shareSales || [], // সেলসের লিস্ট এখানে থাকবে
            endPoints: 
                {
                    totalIncome: totals.income,
                    totalExpense: totals.expense,
                    netProfit: totals.income - totals.expense,
                    data: endPoints || []
                }
        };

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};




const deleteProject = async (req, res) => {

  try {
    const {id} = req.params;
    // check if the project exists
    const existringProject = await Projects.findById(id)
    if(!existringProject){
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

     // ২. চেক করুন এই প্রজেক্টের সাথে কোনো শেয়ার কেনা আছে কিনা
    // (আপনার মডেলের নাম অনুযায়ী Shares/Share ব্যবহার করুন)
    const hasShares = await ShareIssue.findOne({ projectId: id });
    if (hasShares) {
      return res.status(400).json({
        success: false,
        message: "This project cannot be deleted because Shares have already Issued shares in it!",
      });
    }

    await Projects.findByIdAndDelete(id);
        return res.status(200).json({
            success: true, 
            message: "Project deleted successfully" 
        });
  } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message 
        });
  }
};

// Update Project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and update the project with new data from req.body
        const updatedProject = await Projects.findByIdAndUpdate(
            id,
            { $set: req.body },
            { returnDocument: 'after', runValidators: true } 
        );

        if (!updatedProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Project updated successfully",
            project: updatedProject 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {createProject, getProjects, getProject, deleteProject, updateProject, projectAllDetails, getProjectDetailsById}