const SavedJob = require("../models/SavedJob");

exports.saveJob = async (req, res) => {
    try {
        //const jobId = req.params.jobId;
        const exists = await SavedJob.findOne({ job: req.params.jobId, jobseeker: req.user._id });
        if (exists) {
            return res.status(400).json({ message: "Job already saved" });
        }

        const saved = await SavedJob.create({ job: req.params.jobId, jobseeker: req.user._id });
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

exports.getMySavedJobs = async (req, res) => {
    try {
        //const savedJobs = await SavedJob.find({ user: req.user._id }).populate('job').sort({ createdAt: -1 });
        const savedJobs = await SavedJob.find({ jobseeker: req.user._id })
        .populate({ 
            path: 'job', 
            populate: { 
                path: "company", 
                select: "name companyName companyLogo" 
            } 
        });
        res.json(savedJobs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}
exports.unsaveJob = async (req, res) => {
    try {
        const jobId = req.params.jobId; 

        await SavedJob.findOneAndDelete({ job: jobId, jobseeker: req.user._id });
        res.json({ message: "Job removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}