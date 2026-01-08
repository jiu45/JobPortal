import { useState, useEffect } from "react";
import { X, Briefcase, Loader, Send, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CoverLetterGenerator from "../../components/CoverLetterGenerator";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const ApplicationForm = ({ job, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        skills: [],
        coverLetter: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    useEffect(() => {
        // Pre-fill form with user profile data
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                skills: user.skills || [],
                coverLetter: "",
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Normalize skill for comparison (lowercase, remove version numbers, trim)
    const normalizeSkill = (skill) => {
        return skill
            .toLowerCase()
            .trim()
            .replace(/[\d.]+$/, '') // Remove trailing version numbers
            .replace(/\s+/g, ' ');
    };

    // Check if skill already exists (with normalization)
    const isSkillDuplicate = (newSkill) => {
        const normalizedNew = normalizeSkill(newSkill);
        return formData.skills.some(
            (existing) => normalizeSkill(existing) === normalizedNew
        );
    };

    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
        const trimmedSkill = skillInput.trim();

        if (!trimmedSkill) {
            return;
        }

        // Check for exact match
        if (formData.skills.includes(trimmedSkill)) {
            toast.error(`"${trimmedSkill}" is already in your skills.`);
            return;
        }

        // Check for similar skills (normalized)
        if (isSkillDuplicate(trimmedSkill)) {
            const existingMatch = formData.skills.find(
                (s) => normalizeSkill(s) === normalizeSkill(trimmedSkill)
            );
            toast.error(`Similar skill "${existingMatch}" already exists.`);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, trimmedSkill],
        }));
        setSkillInput("");
        toast.success(`Added "${trimmedSkill}" to skills.`);
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((skill) => skill !== skillToRemove),
        }));
    };

    const handleCoverLetterGenerated = (letter) => {
        setFormData((prev) => ({
            ...prev,
            coverLetter: letter,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.coverLetter) {
            toast.error("Please add a cover letter");
            return;
        }

        setSubmitting(true);

        try {
            const applicationData = {
                coverLetter: formData.coverLetter,
                customData: {
                    name: formData.name,
                    email: formData.email,
                    bio: formData.bio,
                    skills: formData.skills,
                },
            };

            await axiosInstance.post(
                API_PATHS.APPLICATIONS.APPLY_TO_JOB(job._id),
                applicationData
            );

            toast.success("Application submitted successfully!");
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to submit application. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Briefcase className="w-6 h-6 text-emerald-600 mr-3" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Apply for Position</h2>
                            <p className="text-sm text-gray-600">{job.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">
                            Pre-filled from your profile. You can edit for this application only.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Professional Summary
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                placeholder="Brief summary of your experience and qualifications..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Skills
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill(e)}
                                    placeholder="Add a skill..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-2 text-emerald-600 hover:text-emerald-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                        <div className="flex items-center">
                            <FileText className="w-5 h-5 text-emerald-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
                        </div>

                        <CoverLetterGenerator
                            jobId={job._id}
                            onGenerated={handleCoverLetterGenerated}
                        />

                        {!formData.coverLetter && (
                            <p className="text-sm text-amber-600">
                                ⚠️ Cover letter is required. Use AI generator or write your own.
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !formData.coverLetter}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {submitting ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;
