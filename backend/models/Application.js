const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String }, // Path to resume submitted with this application
    coverLetter: { type: String }, // AI-generated or custom cover letter

    // Application-specific data (may differ from user profile)
    customData: {
        name: String,
        email: String,
        skills: [String],
        bio: String
    },

    // AI match score for this application
    matchScore: {
        score: Number,
        reason: String,
        matchedSkills: [String],
        missingSkills: [String]
    },

    // Additional answers for job-specific questions
    additionalAnswers: {
        type: Map,
        of: String
    },

    status: { type: String, enum: ['Applied', 'In Review', 'Rejected', 'Accepted'], default: 'Applied' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);