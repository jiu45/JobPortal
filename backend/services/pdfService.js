/**
 * Extract text from PDF buffer using pdf-parse
 * Note: Requires pdf-parse@1.1.1 - run: npm install pdf-parse@1.1.1
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (pdfBuffer) => {
    try {
        // Dynamic import to handle different module formats
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Failed to extract text from PDF: " + error.message);
    }
};

module.exports = {
    extractTextFromPDF,
};

