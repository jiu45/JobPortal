const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can create job postings' });
        }

        const job = await Job.create({...req.body, employer: req.user._id });
        res.status(201).json(job);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getJobs = async (req, res) => {

    const {
        keyword,
        location,
        category,
        type,
        minSalary,
        maxSalary,
        userId,
    } = req.query;

    const query = { 
        isClosed: false,
        ...(keyword && { title: { $regex: keyword, $options: 'i' } }),
        ...(location && { location: { $regex: location, $options: 'i' } }),
        ...(category && { category }),
        ...(type && { type }),
    };

    if (minSalary || maxSalary) {
        query.$and = [];
        if (minSalary) {
            query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
        }
        if (maxSalary) {
            query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
        }
        if (query.$and.length === 0) {
            delete query.$and;
        }
    }

    try {
        const jobs = await Job.find(query).populate('company', 'name companyName companyLogo');
        let savedJobIds = [];
        let appliedJobsStatusMap = {};

        if (userId) {
            const savedJobs = await SavedJob.find({ jobseeker: userId }).select('job');
            savedJobIds = savedJobs.map(sj => sj.job.toString());
            const applications = await Application.find({ applicant: userId }).select('job status');
            applications.forEach(app => {
                appliedJobsStatusMap[app.job.toString()] = app.status;
            });
        }

        //Add isSaved and applicationStatus fields
        const jobsWithExtras = jobs.map(job => {
            const jobObj = job.toObject();
            jobObj.isSaved = savedJobIds.includes(job._id.toString());
            jobObj.applicationStatus = appliedJobsStatusMap[job._id.toString()] || null;
            return jobObj;
        });
        res.json(jobsWithExtras);
        
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

}

exports.getJobsEmployer = async (req, res) => {
    try {
        const UserId = req.user._id;
        const {role} = req.user;

        if (role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can access their job postings' });
        }

        //Get all jobs posted by this employer
        const jobs = await Job.find({ company: UserId }).populate('company', 'name companyName companyLogo').lean();


        //Count applications for each job
        const JobsWithApplicationCounts = await Promise.all(jobs.map(async (job) => {
            const applicationCount = await Application.countDocuments({ job: job._id });
            return { ...job, applicationCount };
        }));

        res.json(JobsWithApplicationCounts);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

}

//Get singel job by ID

exports.getJobById = async (req, res) => {
     try {
        const {userId} = req.query;
        const job = await Job.findById(req.params.id).populate('company', 'name companyName companyLogo');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        let applicationStatus = null;

        if (userId) {
            const application = await Application.findOne({ job: job._id, applicant: userId }).select('status');
            if (application) {
                applicationStatus = application.status;
            }
        }

        res.json({ ...job.toObject(), applicationStatus });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

}


exports.updateJob = async (req, res) => {
     try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        Object.assign(job, req.body);
        const updated = await job.save();
        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

}

exports.deleteJob = async (req, res) => {
     try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }

}


//Toggle job open/close status

exports.toggleJobClose = async (req, res) => {
     try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        job.isClosed = !job.isClosed;
        await job.save();
        res.json({ message: `Job is now ${job.isClosed ? 'closed' : 'open'}` });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}