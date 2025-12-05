const Application = require('../models/Application');
//const User = require('../models/User');
const Job = require('../models/Job');

//Apply to a job
exports.applyToJob = async (req, res) => {
     try {
        const { jobId, resume } = req.body;

        if (req.user.role !== 'jobseeker') {
            return res.status(403).json({ message: 'Only jobseekers can apply to jobs' });
        }

        const existingApplication = await Application.findOne({ job: jobId, applicant: req.user._id });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        const application = await Application.create({
            job: jobId,
            applicant: req.user._id,
            resume,
        });
        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.getMyApplications = async (req, res) => {
     try {
        //const { jobId, resume } = req.body;
        const apps = await Application.find({ applicant: req.user._id }).populate('job').sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.getApplicantsForJob = async (req, res) => {
     try {
        //const { jobId, resume } = req.body;
        const job = await Job.findById(req.params.jobId);

        if (!job || job.company.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Not authorized to view applicants' });
        }

        const applications = await Application.find({ job: req.params.jobId }).populate('job', 'title location category type').populate('applicant', 'name email avatar resume');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.getApplicationById = async (req, res) => {
     try {
        //const { jobId, resume } = req.body;
        const app = await Application.findById(req.params.id).populate('job', 'title').populate('applicant', 'name email avatar resume');

        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const isOwner = app.applicant._id.toString() === req.user._id.toString() || app.job.company.toString() === req.user._id.toString();

        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to view this application' });
        }

        res.json(app);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}


exports.updateStatus = async (req, res) => {
     try {
        //const { jobId, resume } = req.body;
        const { status } = req.body;
        const app = await Application.findById(req.params.id).populate('job');

        if (!app || app.job.company.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Not authorized to update this application' });
        }

        app.status = status;
        await app.save();
        res.json({ message: 'Application status updated', status: app.status });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}