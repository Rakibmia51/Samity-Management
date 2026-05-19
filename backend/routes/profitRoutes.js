const express = require('express');
const router = express.Router();
const { 
    getProjectSummary, 
    calculateAndSaveMonthlyProfit, 
    getProfitHistory, 
    updateProfitStatus,
    getProfitDetails
} = require('../controllers/profitController');

// ১. ড্রপডাউন থেকে প্রোজেক্ট সিলেক্ট করলে সামারি ডেটা দেখানোর জন্য
// GET: /api/profit/project-summary/:projectId
router.get('/project-summary/:projectId', getProjectSummary);

// ২. ক্যালকুলেশন করা ডেটা ডাটাবেজে রেকর্ড হিসেবে সেভ করার জন্য
// POST: /api/profit/save
router.post('/save', calculateAndSaveMonthlyProfit);

// ৩. আগের করা সব প্রফিট ক্যালকুলেশনের লিস্ট দেখার জন্য
// GET: /api/profit/history
router.get('/history', getProfitHistory);

router.put('/status/:id', updateProfitStatus)

router.get('/details/:id', getProfitDetails);

module.exports = router;
