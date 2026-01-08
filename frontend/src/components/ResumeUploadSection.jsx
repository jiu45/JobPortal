import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { parseResume } from "../utils/aiService";

const ResumeUploadSection = ({ onParsedData }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        // Validate file type
        if (selectedFile.type !== "application/pdf") {
            setError("Please upload a PDF file");
            setFile(null);
            return;
        }

        // Validate file size (5MB max)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError("");
        setSuccess(false);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setUploading(true);
        setError("");
        setSuccess(false);

        try {
            const result = await parseResume(file);

            if (result.data) {
                setSuccess(true);
                // Call parent callback with parsed data
                if (onParsedData) {
                    onParsedData(result.data);
                }
            }
        } catch (err) {
            console.error("Error parsing resume:", err);
            setError(
                err.response?.data?.message ||
                "Failed to parse resume. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                    Upload Resume
                </h3>
                {success && (
                    <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Parsed successfully!
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Upload your resume and we'll automatically extract your skills, experience, and education using AI.
            </p>

            {/* File Input */}
            <div className="space-y-4">
                <div>
                    <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="resume-upload"
                        className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center hover:bg-gray-100 transition-colors"
                    >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                            {file ? file.name : "Click to upload PDF"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            Maximum file size: 5MB
                        </span>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Upload Button */}
                {file && !success && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Parsing Resume...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Parse with AI
                            </>
                        )}
                    </button>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                            ✅ Your resume has been parsed! Review the auto-filled information below and make any necessary adjustments.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadSection;
