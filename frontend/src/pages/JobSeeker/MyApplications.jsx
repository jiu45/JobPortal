import { useState, useEffect } from "react";
import { FileText, Clock, Building2, MapPin, ChevronRight, Loader } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/StatusBadge";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axiosInstance.get("/api/applications/my");
            setApplications(response.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        if (filter === "all") return true;
        return app.status.toLowerCase() === filter.toLowerCase();
    });

    const getStatusStats = () => {
        const stats = {
            all: applications.length,
            applied: 0,
            "in review": 0,
            accepted: 0,
            rejected: 0,
        };
        applications.forEach((app) => {
            const status = app.status.toLowerCase();
            if (stats[status] !== undefined) {
                stats[status]++;
            }
        });
        return stats;
    };

    const stats = getStatusStats();

    return (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
                    <p className="text-gray-600">Track your job applications and their status</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: "all", label: "All" },
                        { key: "applied", label: "Applied" },
                        { key: "in review", label: "In Review" },
                        { key: "accepted", label: "Accepted" },
                        { key: "rejected", label: "Rejected" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.key
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                                {stats[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === "all"
                                ? "You haven't applied to any jobs yet."
                                : `No applications with "${filter}" status.`}
                        </p>
                        <Link
                            to="/find-jobs"
                            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app) => (
                            <div
                                key={app._id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {app.job?.title || "Job title unavailable"}
                                            </h3>
                                            <StatusBadge status={app.status} />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                            {app.job?.company && (
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{app.job.company?.companyName || "Company"}</span>
                                                </div>
                                            )}
                                            {app.job?.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{app.job.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Applied {moment(app.createdAt).fromNow()}</span>
                                            </div>
                                        </div>

                                        {/* Match Score if available */}
                                        {app.matchScore?.score && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm text-gray-600">Match Score:</span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${app.matchScore.score >= 75
                                                            ? "bg-green-100 text-green-700"
                                                            : app.matchScore.score >= 50
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {app.matchScore.score}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/job/${app.job?._id}`}
                                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                    >
                                        View Job <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Timeline */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Applied: {moment(app.createdAt).format("MMM D, YYYY")}</span>
                                        {app.updatedAt !== app.createdAt && (
                                            <>
                                                <span>•</span>
                                                <span>Last updated: {moment(app.updatedAt).fromNow()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
