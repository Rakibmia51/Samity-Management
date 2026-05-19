const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createInvestmentEndpoint, getEndpointsByProject, deleteEndpoint,getAllInvestmentData } = require('../controllers/endPointController');



// নতুন ডাটা সেভ করতে
router.post('/add', createInvestmentEndpoint);

// প্রজেক্ট সব লিস্ট দেখতে
router.get('/', getAllInvestmentData);

// প্রজেক্ট আইডি দিয়ে সব লিস্ট দেখতে
router.get('/:projectId', getEndpointsByProject);

// নির্দিষ্ট আইডি দিয়ে ডিলিট করতে
router.delete('/delete/:id', deleteEndpoint);

module.exports = router;
