const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");
const {
    parseResume,
    generateCoverLetter,
    calculateMatchScore,
    calculateAdvancedMatchScore,
} = require("../controllers/aiController");

const router = express.Router();

// Configure multer for memory storage (PDF files)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});

// AI Routes - All protected (require authentication)
router.post("/parse-resume", protect, upload.single("resume"), parseResume);
router.post("/generate-cover-letter", protect, generateCoverLetter);
router.post("/match-score", protect, calculateMatchScore);
router.post("/advanced-match", protect, calculateAdvancedMatchScore);

module.exports = router;
