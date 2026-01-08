import { useState } from "react";
import { Sparkles, Loader, CheckCircle, RefreshCw } from "lucide-react";
import { generateCoverLetter } from "../utils/aiService";

const CoverLetterGenerator = ({ jobId, onGenerated }) => {
    const [coverLetter, setCoverLetter] = useState("");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!jobId) {
            setError("Job ID is required");
            return;
        }

        setGenerating(true);
        setError("");

        try {
            const letter = await generateCoverLetter(jobId);
            setCoverLetter(letter);
            setGenerated(true);

            if (onGenerated) {
                onGenerated(letter);
            }
        } catch (err) {
            console.error("Error generating cover letter:", err);
            setError(
                err.response?.data?.message ||
                "Failed to generate cover letter. Please ensure your profile is complete."
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = () => {
        setCoverLetter("");
        setGenerated(false);
        handleGenerate();
    };

    const handleEdit = (e) => {
        setCoverLetter(e.target.value);
        if (onGenerated) {
            onGenerated(e.target.value);
        }
    };

    return (
        <div className="space-y-4">
            {!generated ? (
                <div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {generating ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Generating with AI...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Cover Letter with AI
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        AI will create a personalized cover letter based on your profile and the job requirements
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Generated successfully!</span>
                        </div>
                        <button
                            onClick={handleRegenerate}
                            disabled={generating}
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center disabled:opacity-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Regenerate
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Letter (Editable)
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={handleEdit}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Your cover letter will appear here..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Feel free to edit and personalize the generated content
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
};

export default CoverLetterGenerator;
