const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { getMyShareStats } = require('../controllers/memberSide');


const router = express.Router();


// For Member Frontend

//মেম্বার শুধু তার নিজের স্ট্যাটাস এবং সেল দেখবে (এটি আপনার ড্যাশবোর্ডে কল হবে)
router.get('/my-stats',authMiddleware, getMyShareStats);

module.exports = router;