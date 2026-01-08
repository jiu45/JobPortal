import { useState, useEffect } from "react";
import { Target, Loader, TrendingUp, AlertCircle } from "lucide-react";
import { calculateMatchScore } from "../utils/aiService";

const JobMatchScore = ({ jobId }) => {
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (jobId) {
            fetchMatchScore();
        }
    }, [jobId]);

    const fetchMatchScore = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await calculateMatchScore(jobId);
            setMatchData(data);
        } catch (err) {
            console.error("Error calculating match score:", err);
            setError(
                err.response?.data?.message ||
                "Could not calculate match score. Please ensure your profile has skills listed."
            );
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getProgressColor = (score) => {
        if (score >= 75) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
                    <span className="text-gray-600">Calculating match score...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Match Score Unavailable</p>
                        <p className="text-sm text-amber-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!matchData) {
        return null;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-emerald-600" />
                    Job Match Score
                </h3>
                <div
                    className={`px-4 py-2 rounded-full border font-bold text-2xl ${getScoreColor(
                        matchData.score
                    )}`}
                >
                    {matchData.score}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                            matchData.score
                        )}`}
                        style={{ width: `${matchData.score}%` }}
                    />
                </div>
            </div>

            {/* Explanation */}
            <div className="mb-4">
                <p className="text-sm text-gray-700">{matchData.reason}</p>
            </div>

            {/* Matched Skills */}
            {matchData.matchedSkills && matchData.matchedSkills.length > 0 && (
                <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        Matching Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matchData.matchedSkills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Skills */}
            {matchData.missingSkills && matchData.missingSkills.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-amber-600" />
                        Skills to Improve:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matchData.missingSkills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobMatchScore;
