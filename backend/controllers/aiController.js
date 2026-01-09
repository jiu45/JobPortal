const { extractTextFromPDF } = require("../services/pdfService");
const {
    parseResumeWithAI,
    generateCoverLetter,
    calculateJobMatch,
    calculateAdvancedMatch,
    generateInterviewQuestion,
    evaluateInterviewAnswer,
} = require("../services/groqService");
const User = require("../models/User");
const Job = require("../models/Job");

/**
 * Parse Resume PDF
 * POST /api/ai/parse-resume
 * Protected route - requires authentication
 */
exports.parseResume = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF file" });
        }

        // Extract text from PDF
        const resumeText = await extractTextFromPDF(req.file.buffer);

        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(400).json({
                message: "Could not extract valid text from PDF. Please ensure the file is readable.",
            });
        }

        // Parse resume with AI
        const parsedData = await parseResumeWithAI(resumeText);

        // Return parsed data
        res.status(200).json({
            message: "Resume parsed successfully",
            data: parsedData,
        });
    } catch (error) {
        console.error("Error in parseResume:", error);
        res.status(500).json({
            message: "Failed to parse resume",
            error: error.message,
        });
    }
};

/**
 * Generate Cover Letter
 * POST /api/ai/generate-cover-letter
 * Body: { jobId: string }
 */
exports.generateCoverLetter = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user._id;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch job data
        const job = await Job.findById(jobId).populate("company", "name companyName");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Prepare user data for AI
        const userData = {
            name: user.name,
            bio: user.bio || "",
            skills: user.skills || [],
            experience: user.experience || [],
        };

        // Prepare job data for AI
        const jobData = {
            title: job.title,
            company: job.company?.companyName || job.company?.name || "the company",
            description: job.description,
            requirements: job.requirements || job.description,
        };

        // Generate cover letter
        const coverLetter = await generateCoverLetter(userData, jobData);

        res.status(200).json({
            message: "Cover letter generated successfully",
            coverLetter,
        });
    } catch (error) {
        console.error("Error in generateCoverLetter:", error);
        res.status(500).json({
            message: "Failed to generate cover letter",
            error: error.message,
        });
    }
};

/**
 * Calculate Job Match Score
 * POST /api/ai/match-score
 * Body: { jobId: string }
 */
exports.calculateMatchScore = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user._id;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch job data
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Get user skills
        const userSkills = user.skills || [];

        if (userSkills.length === 0) {
            return res.status(400).json({
                message: "Please add skills to your profile to calculate match score",
            });
        }

        // Get job requirements
        const jobRequirements = job.requirements || job.description;

        // Calculate match score
        const matchResult = await calculateJobMatch(userSkills, jobRequirements, {
            title: job.title,
        });

        res.status(200).json({
            message: "Match score calculated successfully",
            matchScore: matchResult,
        });
    } catch (error) {
        console.error("Error in calculateMatchScore:", error);
        res.status(500).json({
            message: "Failed to calculate match score",
            error: error.message,
        });
    }
};

/**
 * Calculate Advanced Job Match Score (with experience, location, culture fit)
 * POST /api/ai/advanced-match
 * Body: { jobId: string, userId?: string } - userId optional for employers checking candidates
 */
exports.calculateAdvancedMatchScore = async (req, res) => {
    try {
        const { jobId, userId: candidateId } = req.body;
        const requesterId = req.user._id;

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // Determine whose profile to analyze - candidate or requester
        const targetUserId = candidateId || requesterId;

        // Fetch user data
        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch job data
        const job = await Job.findById(jobId).populate("company", "companyName");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check authorization: user can check own match OR employer can check candidates for their jobs
        const isOwnProfile = targetUserId.toString() === requesterId.toString();
        const isJobOwner = job.company._id.toString() === requesterId.toString();

        if (!isOwnProfile && !isJobOwner) {
            return res.status(403).json({
                message: "Not authorized to calculate match for this candidate"
            });
        }

        // Prepare data for advanced match
        const userData = {
            name: user.name,
            bio: user.bio || "",
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            location: user.location || "",
        };

        const jobData = {
            title: job.title,
            company: job.company?.companyName || "Company",
            description: job.description,
            requirements: job.requirements || job.description,
            location: job.location || "",
            type: job.type || "",
        };

        // Calculate advanced match
        const matchResult = await calculateAdvancedMatch(userData, jobData);

        res.status(200).json({
            message: "Advanced match calculated successfully",
            advancedMatch: matchResult,
        });
    } catch (error) {
        console.error("Error in calculateAdvancedMatchScore:", error);
        res.status(500).json({
            message: "Failed to calculate advanced match",
            error: error.message,
        });
    }
};

/**
 * Start Interview - Generate a question
 * POST /api/ai/interview/start
 * Protected route - requires authentication
 */
exports.startInterview = async (req, res) => {
    try {
        const { jobRole, jobDescription } = req.body;

        if (!jobRole) {
            return res.status(400).json({
                message: "Job role is required",
            });
        }

        // Generate interview question
        const questionData = await generateInterviewQuestion(jobRole, jobDescription || "");

        res.status(200).json({
            message: "Interview question generated successfully",
            data: {
                jobRole,
                ...questionData,
            },
        });
    } catch (error) {
        console.error("Error in startInterview:", error);
        res.status(500).json({
            message: "Failed to generate interview question",
            error: error.message,
        });
    }
};

/**
 * Get Interview Feedback - Evaluate answer
 * POST /api/ai/interview/feedback
 * Protected route - requires authentication
 */
exports.getInterviewFeedback = async (req, res) => {
    try {
        const { question, userAnswer, jobRole } = req.body;

        if (!question || !userAnswer) {
            return res.status(400).json({
                message: "Question and answer are required",
            });
        }

        if (userAnswer.trim().length < 10) {
            return res.status(400).json({
                message: "Answer is too short. Please provide a more detailed response.",
            });
        }

        // Evaluate the answer
        const feedback = await evaluateInterviewAnswer(question, userAnswer, jobRole || "");

        res.status(200).json({
            message: "Feedback generated successfully",
            data: feedback,
        });
    } catch (error) {
        console.error("Error in getInterviewFeedback:", error);
        res.status(500).json({
            message: "Failed to generate feedback",
            error: error.message,
        });
    }
};
