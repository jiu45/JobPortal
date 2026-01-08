import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download, Trash2 } from "lucide-react";
import { parseResume } from "../utils/aiService";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const ResumeUploadSection = ({ onParsedData, existingResume, onResumeUploaded, onResumeDeleted }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [uploadedResumeUrl, setUploadedResumeUrl] = useState(existingResume || "");

    console.log("ResumeUploadSection - existingResume prop:", existingResume);
    console.log("ResumeUploadSection - uploadedResumeUrl state:", uploadedResumeUrl);

    // Sync uploadedResumeUrl with existingResume prop changes
    useEffect(() => {
        if (existingResume) {
            setUploadedResumeUrl(existingResume);
        }
    }, [existingResume]);

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

    const handleUploadAndParse = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setUploading(true);
        setParsing(false);
        setError("");
        setSuccess(false);

        try {
            // Step 1: Upload the resume file to server
            const uploadFormData = new FormData();
            uploadFormData.append("resume", file);

            const uploadResponse = await axiosInstance.post(
                "/api/user/upload-resume",
                uploadFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const resumeUrl = uploadResponse.data.resumeUrl;
            setUploadedResumeUrl(resumeUrl);

            if (onResumeUploaded) {
                onResumeUploaded(resumeUrl);
            }

            toast.success("Resume uploaded successfully!");

            // Step 2: Parse the resume with AI
            setParsing(true);
            setUploading(false);

            const result = await parseResume(file);

            if (result.data) {
                setSuccess(true);
                // Call parent callback with parsed data
                if (onParsedData) {
                    onParsedData(result.data);
                }
                toast.success("Resume parsed with AI!");
            }
        } catch (err) {
            console.error("Error uploading/parsing resume:", err);
            setError(
                err.response?.data?.message ||
                "Failed to upload/parse resume. Please try again."
            );
        } finally {
            setUploading(false);
            setParsing(false);
        }
    };

    const handleDownload = async () => {
        if (!uploadedResumeUrl) {
            toast.error("No resume URL available");
            return;
        }

        console.log("Attempting to download resume from:", uploadedResumeUrl);

        try {
            // Use axiosInstance for proper proxy handling
            const response = await axiosInstance.get(uploadedResumeUrl, {
                responseType: 'blob'
            });

            console.log("Response status:", response.status);
            console.log("Response content-type:", response.headers['content-type']);

            // Check content type
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Resume file not found on server');
            }

            const blob = response.data;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = uploadedResumeUrl.split("/").pop() || "resume.pdf";
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Resume downloaded!");
        } catch (error) {
            console.error("Error downloading resume:", error);
            toast.error(`Failed to download: ${error.message}`);
        }
    };

    const getFilename = (url) => {
        if (!url) return "resume.pdf";
        const parts = url.split("/");
        return parts[parts.length - 1].replace(/^\d+-/, ""); // Remove timestamp prefix
    };

    // If resume already uploaded, show compact view
    if (uploadedResumeUrl && !file) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Resume Uploaded</p>
                            <p className="text-xs text-gray-500">{getFilename(uploadedResumeUrl)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Download Resume"
                        >
                            <Download className="w-5 h-5 text-emerald-600" />
                        </button>
                        <label
                            htmlFor="resume-upload-replace"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Upload New Resume"
                        >
                            <Upload className="w-5 h-5 text-gray-500" />
                            <input
                                type="file"
                                id="resume-upload-replace"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>
        );
    }

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
                        Uploaded & Parsed!
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
                        onClick={handleUploadAndParse}
                        disabled={uploading || parsing}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Uploading Resume...
                            </>
                        ) : parsing ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Parsing with AI...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Upload & Parse with AI
                            </>
                        )}
                    </button>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                            ✅ Your resume has been uploaded and parsed! Review the auto-filled information below.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadSection;

