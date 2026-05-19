const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const {getShareIssuesByProject , createShareIssue,getLatestPrice, getShareIssues, singleShareIssue, updateShareIssue, deleteShareIssue } = require('../controllers/shareIssueController');



const router = express.Router();

router.post("/create", createShareIssue);
router.get("/", getShareIssues);
router.get("/:id", singleShareIssue);

router.delete("/delete/:id", deleteShareIssue);
router.put("/update/:id", updateShareIssue);

router.get("/latest-price/:projectId",getLatestPrice )

router.get('/project/:projectId', getShareIssuesByProject);





module.exports = router;