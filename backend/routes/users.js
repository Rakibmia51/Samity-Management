const express = require('express');
const { addUser, getUsers, deleteUser, getProfile, updateUser, statusUpdate, memberSearch, changePassword } = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

router.post("/add", addUser);
router.get("/",authMiddleware, getUsers);
router.delete("/delete/:id",authMiddleware, deleteUser);
router.put("/update/:id", updateUser);

router.patch('/status/:id', statusUpdate)

router.get("/profile",authMiddleware, getProfile);
// পাসওয়ার্ড পরিবর্তনের জন্য
router.put('/change-password', authMiddleware, changePassword);

router.get("/member-search/:code", memberSearch);



module.exports = router;