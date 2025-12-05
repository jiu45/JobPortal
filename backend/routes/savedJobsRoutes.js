const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
    saveJob,
    getMySavedJobs,
    unsaveJob,
} = require("../controllers/savedJobsController");

router.post("/:jobId", protect, saveJob);
router.delete("/:jobId", protect, unsaveJob);
router.get("/my", protect, getMySavedJobs);

module.exports = router;