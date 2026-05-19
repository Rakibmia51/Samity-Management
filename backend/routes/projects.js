const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, getProject, deleteProject, updateProject,projectAllDetails, getProjectDetailsById } = require('../controllers/projectsController');


const router = express.Router();

router.post("/create",authMiddleware, createProject);
router.get("/", getProjects);
router.get("/all", projectAllDetails);
router.get('/details/:id', getProjectDetailsById);
router.get("/:id", getProject);

router.delete("/delete/:id", authMiddleware, deleteProject);
router.put("/update/:id",authMiddleware, updateProject);









module.exports = router;