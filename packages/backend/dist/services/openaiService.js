"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReceiptWithOpenAI = parseReceiptWithOpenAI;
const openai_1 = __importDefault(require("openai"));
// Only initialize OpenAI if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
}
async function parseReceiptWithOpenAI(receiptText) {
    // If OpenAI is not available, use basic parsing
    if (!openai) {
        console.log('OpenAI not configured, using basic parsing');
        return parseReceiptBasic(receiptText);
    }
    const prompt = `Extract the following details from this receipt text in JSON format: vendor, amount, transactionDate (YYYY-MM-DD), category (e.g., Food, Transport, Utilities), description. If a field is not found, use null. Receipt text: ${receiptText}`;
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
        response_format: { type: "json_object" },
    });
    const content = chatCompletion.choices[0].message.content;
    if (content) {
        return JSON.parse(content);
    }
    else {
        throw new Error("Failed to parse receipt with OpenAI");
    }
}
// Basic parser for when OpenAI is not available
function parseReceiptBasic(receiptText) {
    const lines = receiptText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let vendor = 'Unknown Vendor';
    let amount = 0;
    let transactionDate = new Date().toISOString().split('T')[0];
    let category = 'General';
    let description = '';
    // Extract amount - look for patterns like "AMOUNT 84.80", "Total: $25.50", etc.
    const amountPatterns = [
        /AMOUNT\s+(\d+\.?\d*)/i,
        /Total[:\s]*\$?(\d+\.?\d*)/i,
        /Balance[:\s]*\$?(\d+\.?\d*)/i,
        /Amount[:\s]*\$?(\d+\.?\d*)/i
    ];
    for (const pattern of amountPatterns) {
        const match = receiptText.match(pattern);
        if (match) {
            amount = parseFloat(match[1]);
            break;
        }
    }
    // Extract date - look for date patterns
    const datePatterns = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
        /Date[:\s]*(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/i,
        /Dace[:\s]*(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/i // Handle OCR typo
    ];
    for (const pattern of datePatterns) {
        const match = receiptText.match(pattern);
        if (match) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            const fullYear = year < 100 ? 2000 + year : year;
            transactionDate = `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            break;
        }
    }
    // Extract vendor - look for store names in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        // Skip lines that are clearly not vendor names
        if (line.includes('Address') || line.includes('Tel') || line.includes('Date') ||
            line.includes('Amount') || line.includes('Total') || line.includes('Balance') ||
            line.match(/^\d/) || line.includes('$')) {
            continue;
        }
        // If line looks like a vendor name (not too long, no special chars)
        if (line.length > 2 && line.length < 50 && !line.includes(':')) {
            vendor = line;
            break;
        }
    }
    // Extract description from item lines
    const itemLines = lines.filter(line => line.includes('$') ||
        line.match(/\d+\.\d{2}/) ||
        line.includes('Loren') || line.includes('psun') || line.includes('Dolor'));
    if (itemLines.length > 0) {
        description = itemLines.slice(0, 3).join(', ');
    }
    // Determine category based on vendor or description
    const vendorLower = vendor.toLowerCase();
    const descLower = description.toLowerCase();
    if (vendorLower.includes('grocery') || vendorLower.includes('food') || vendorLower.includes('market') ||
        descLower.includes('food') || descLower.includes('grocery')) {
        category = 'Food';
    }
    else if (vendorLower.includes('gas') || vendorLower.includes('fuel') || vendorLower.includes('station')) {
        category = 'Transport';
    }
    else if (vendorLower.includes('pharmacy') || vendorLower.includes('drug')) {
        category = 'Healthcare';
    }
    else if (vendorLower.includes('restaurant') || vendorLower.includes('cafe') || vendorLower.includes('diner')) {
        category = 'Dining';
    }
    else {
        category = 'General';
    }
    return {
        vendor,
        amount,
        transactionDate,
        category,
        description: description || 'Receipt items'
    };
}
//# sourceMappingURL=openaiService.js.map