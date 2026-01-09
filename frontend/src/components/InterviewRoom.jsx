import { useState } from "react";
import {
    Mic,
    Send,
    Loader2,
    MessageSquare,
    Star,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const InterviewRoom = ({ jobRole, jobDescription, onClose }) => {
    const [question, setQuestion] = useState(null);
    const [questionMeta, setQuestionMeta] = useState(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState("start"); // start, question, feedback

    // Start interview - Generate question
    const handleStartInterview = async () => {
        setLoading(true);
        setFeedback(null);
        setUserAnswer("");

        try {
            const response = await axiosInstance.post("/api/ai/interview/start", {
                jobRole,
                jobDescription,
            });

            const data = response.data.data;
            setQuestion(data.question);
            setQuestionMeta({
                category: data.category,
                difficulty: data.difficulty,
                expectedTopics: data.expectedTopics,
                hints: data.hints,
            });
            setStep("question");
        } catch (error) {
            console.error("Error starting interview:", error);
            toast.error(error.response?.data?.message || "Failed to generate question");
        } finally {
            setLoading(false);
        }
    };

    // Submit answer for feedback
    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            toast.error("Please enter your answer");
            return;
        }

        if (userAnswer.trim().length < 10) {
            toast.error("Please provide a more detailed answer");
            return;
        }

        setSubmitting(true);

        try {
            const response = await axiosInstance.post("/api/ai/interview/feedback", {
                question,
                userAnswer,
                jobRole,
            });

            setFeedback(response.data.data);
            setStep("feedback");
        } catch (error) {
            console.error("Error getting feedback:", error);
            toast.error(error.response?.data?.message || "Failed to get feedback");
        } finally {
            setSubmitting(false);
        }
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600 bg-green-100";
        if (score >= 6) return "text-blue-600 bg-blue-100";
        if (score >= 4) return "text-yellow-600 bg-yellow-100";
        return "text-red-600 bg-red-100";
    };

    // Get difficulty badge color
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy": return "bg-green-100 text-green-700";
            case "medium": return "bg-yellow-100 text-yellow-700";
            case "hard": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Mock Interview</h2>
                            <p className="text-indigo-100 text-sm">{jobRole}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Start Screen */}
                {step === "start" && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Ready to Practice?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Our AI interviewer will ask you a relevant question for the{" "}
                            <span className="font-semibold text-indigo-600">{jobRole}</span> position.
                            Answer as if you were in a real interview!
                        </p>
                        <button
                            onClick={handleStartInterview}
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Question...
                                </>
                            ) : (
                                <>
                                    <Mic className="w-5 h-5" />
                                    Start Interview
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Question Screen */}
                {step === "question" && question && (
                    <div className="space-y-6">
                        {/* Question Meta Tags */}
                        {questionMeta && (
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questionMeta.difficulty)}`}>
                                    {questionMeta.difficulty}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                    {questionMeta.category}
                                </span>
                            </div>
                        )}

                        {/* Question */}
                        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                            <p className="text-lg font-medium text-gray-900">
                                {question}
                            </p>
                        </div>

                        {/* Answer Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Answer
                            </label>
                            <textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer here... Be thorough and specific."
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {userAnswer.length} characters
                            </p>
                        </div>

                        {/* Hints (collapsible) */}
                        {questionMeta?.hints && (
                            <details className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <summary className="flex items-center gap-2 cursor-pointer text-yellow-800 font-medium">
                                    <Lightbulb className="w-4 h-4" />
                                    Need a hint?
                                </summary>
                                <p className="mt-2 text-sm text-yellow-700">
                                    {questionMeta.hints}
                                </p>
                            </details>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={submitting || userAnswer.trim().length < 10}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Answer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Feedback Screen */}
                {step === "feedback" && feedback && (
                    <div className="space-y-6">
                        {/* Score */}
                        <div className="text-center py-4">
                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${getScoreColor(feedback.score)}`}>
                                <Star className="w-6 h-6" />
                                <span className="text-3xl font-bold">{feedback.score}</span>
                                <span className="text-lg">/ {feedback.maxScore || 10}</span>
                            </div>
                        </div>

                        {/* Overall Feedback */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Overall Feedback</h4>
                            <p className="text-gray-700">{feedback.overallFeedback}</p>
                        </div>

                        {/* Strengths */}
                        {feedback.strengths?.length > 0 && (
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Strengths
                                </h4>
                                <ul className="space-y-1">
                                    {feedback.strengths.map((strength, idx) => (
                                        <li key={idx} className="text-green-700 text-sm flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Areas for Improvement */}
                        {feedback.improvements?.length > 0 && (
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Areas for Improvement
                                </h4>
                                <ul className="space-y-1">
                                    {feedback.improvements.map((item, idx) => (
                                        <li key={idx} className="text-orange-700 text-sm flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Key Points Covered/Missed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feedback.keyPointsCovered?.length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                                        ✓ Key Points Covered
                                    </h4>
                                    <ul className="space-y-1">
                                        {feedback.keyPointsCovered.map((point, idx) => (
                                            <li key={idx} className="text-blue-700 text-xs">• {point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {feedback.keyPointsMissed?.length > 0 && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <h4 className="font-semibold text-red-800 mb-2 text-sm">
                                        ✗ Key Points Missed
                                    </h4>
                                    <ul className="space-y-1">
                                        {feedback.keyPointsMissed.map((point, idx) => (
                                            <li key={idx} className="text-red-700 text-xs">• {point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Suggested Answer */}
                        {feedback.suggestedAnswer && (
                            <details className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                                <summary className="font-semibold text-indigo-800 cursor-pointer">
                                    View Suggested Answer
                                </summary>
                                <p className="mt-3 text-indigo-700 text-sm">
                                    {feedback.suggestedAnswer}
                                </p>
                            </details>
                        )}

                        {/* Tip */}
                        {feedback.tips && (
                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                <p className="text-yellow-800 text-sm flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span><strong>Pro Tip:</strong> {feedback.tips}</span>
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleStartInterview}
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-5 h-5" />
                                )}
                                Next Question
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    End Interview
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewRoom;