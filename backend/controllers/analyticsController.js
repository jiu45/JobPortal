const Job = require("../models/Job");
const Application = require("../models/Application");

const getTrend = (current, previous) => {
    if(previous === 0) {
        return current > 0 ? 100 : 0;
        //return Math.round(((current - previous) / previous) * 100);
    }
    return Math.round(((current - previous) / previous) * 100);
};

exports.getEmployerAnalytics = async (req, res) => {
    try {
        //const employerId = req.user._id;
        if (req.user.role !== "employer") {
            return res.status(403).json({ message: "Only employers can access analytics" });
        }
        const companyId = req.user._id;

        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        const previous7Days = new Date(last7Days);
        previous7Days.setDate(last7Days.getDate() - 7);

        const totalActiveJobs = await Job.countDocuments({ company: companyId, isClosed: false });
        const jobs = await Job.find({ company: companyId }).select("_id").lean();
        const jobIds = jobs.map(job => job._id);

        const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
        const totalHired = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted" });

        //Active Job Posts trend

        const activeJobsLast7Days = await Job.countDocuments({ company: companyId, createdAt: { $gte: last7Days , $lte: now } });
        const activeJobsPrevious7Days = await Job.countDocuments({ company: companyId, createdAt: { $gte: previous7Days, $lt: last7Days } });

        const activeJobsTrend = getTrend(activeJobsLast7Days, activeJobsPrevious7Days);

        //Applications trend
        const applicationsLast7Days = await Application.countDocuments({ job: { $in: jobIds }, createdAt: { $gte: last7Days , $lte: now } });
        const applicationsPrevious7Days = await Application.countDocuments({ job: { $in: jobIds }, createdAt: { $gte: previous7Days, $lt: last7Days } });

        const applicantTrend = getTrend(applicationsLast7Days, applicationsPrevious7Days);

        //Hires trend
        const hiresLast7Days = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: { $gte: last7Days , $lte: now } });
        const hiresPrevious7Days = await Application.countDocuments({ job: { $in: jobIds }, status: "Accepted", createdAt: { $gte: previous7Days, $lt: last7Days } });

        const hireTrend = getTrend(hiresLast7Days, hiresPrevious7Days);

        //Data
        const recentJobs = await Job.find({ company: companyId }).sort({ createdAt: -1 }).limit(5).select("title location type createdAt isClosed");

        const recentApplications = await Application.find({ job: { $in: jobIds } })
            .populate('applicant', 'name email avatar')
            .populate('job', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

            res.json({
                counts: {
                    totalActiveJobs,
                    totalApplications,
                    totalHired,
                    trend: {
                        activeJobs: activeJobsTrend,
                        totalApplications: applicantTrend,
                        totalHired: hireTrend
                    }
                },
                data: {
                    recentJobs,
                    recentApplications
                }
            });
    } catch (error) {
        res.status(500).json({ message: "Fail to fetch analytics" });
    }
}