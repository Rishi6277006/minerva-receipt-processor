"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openaiService_1 = require("./openaiService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EmailService {
    constructor() {
        this.config = {
            user: process.env.EMAIL_USER || '',
            password: process.env.EMAIL_PASSWORD || '',
            host: process.env.EMAIL_HOST || 'imap.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '993'),
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        };
        this.imap = new imap_1.default(this.config);
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                console.log('Email service connected');
                resolve();
            });
            this.imap.once('error', (err) => {
                console.error('Email connection error:', err);
                reject(err);
            });
            this.imap.connect();
        });
    }
    async checkForReceiptEmails() {
        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Search for unread emails with attachments
                this.imap.search(['UNSEEN', 'HEADER', 'Content-Type', 'multipart/mixed'], (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (results.length === 0) {
                        console.log('No new receipt emails found');
                        resolve();
                        return;
                    }
                    console.log(`Found ${results.length} new emails to process`);
                    const fetch = this.imap.fetch(results, { bodies: '', struct: true });
                    fetch.on('message', (msg, seqno) => {
                        let buffer = '';
                        let attachment = null;
                        msg.on('body', (stream, info) => {
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                        });
                        msg.once('attributes', (attrs) => {
                            attachment = attrs.struct;
                        });
                        msg.once('end', async () => {
                            try {
                                const parsed = await (0, mailparser_1.simpleParser)(buffer);
                                await this.processEmail(parsed, attachment);
                            }
                            catch (error) {
                                console.error('Error processing email:', error);
                            }
                        });
                    });
                    fetch.once('error', (err) => {
                        reject(err);
                    });
                    fetch.once('end', () => {
                        console.log('Finished processing emails');
                        resolve();
                    });
                });
            });
        });
    }
    async processEmail(email, attachment) {
        try {
            // Check if email has PDF attachments
            const pdfAttachments = this.extractPdfAttachments(email, attachment);
            if (pdfAttachments.length === 0) {
                console.log('No PDF attachments found in email');
                return;
            }
            console.log(`Found ${pdfAttachments.length} PDF attachments`);
            // Process each PDF attachment
            for (const pdfAttachment of pdfAttachments) {
                await this.processPdfAttachment(pdfAttachment);
            }
        }
        catch (error) {
            console.error('Error processing email:', error);
        }
    }
    extractPdfAttachments(email, attachment) {
        const pdfAttachments = [];
        if (email.attachments && email.attachments.length > 0) {
            for (const attachment of email.attachments) {
                if (attachment.contentType === 'application/pdf') {
                    pdfAttachments.push(attachment);
                }
            }
        }
        return pdfAttachments;
    }
    async processPdfAttachment(attachment) {
        try {
            console.log(`Processing PDF: ${attachment.filename}`);
            // Parse PDF content
            const pdfData = await (0, pdf_parse_1.default)(attachment.content);
            const receiptText = pdfData.text;
            console.log('Extracted text from PDF:', receiptText.substring(0, 200) + '...');
            // Parse receipt with AI
            const parsedReceipt = await (0, openaiService_1.parseReceiptWithOpenAI)(receiptText);
            // Store in database
            await prisma.ledgerEntry.create({
                data: {
                    vendor: parsedReceipt.vendor || 'Unknown Vendor',
                    amount: parseFloat(parsedReceipt.amount) || 0,
                    currency: 'USD',
                    transactionDate: new Date(parsedReceipt.transactionDate),
                    category: parsedReceipt.category || null,
                    description: parsedReceipt.description || null,
                    receiptUrl: `email-attachment-${Date.now()}`
                }
            });
            console.log('Successfully processed and stored receipt from email');
        }
        catch (error) {
            console.error('Error processing PDF attachment:', error);
        }
    }
    async startMonitoring() {
        await this.connect();
        // Check for emails every 5 minutes
        setInterval(async () => {
            try {
                await this.checkForReceiptEmails();
            }
            catch (error) {
                console.error('Error checking emails:', error);
            }
        }, 5 * 60 * 1000);
        // Also check immediately
        await this.checkForReceiptEmails();
    }
    disconnect() {
        this.imap.end();
    }
}
exports.EmailService = EmailService;
// Export singleton instance
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map