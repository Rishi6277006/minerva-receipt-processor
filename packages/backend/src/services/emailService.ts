import Imap from 'imap';
import { simpleParser } from 'mailparser';
import pdf from 'pdf-parse';
import { parseReceiptWithOpenAI } from './openaiService';
import { oauthService } from './oauthService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions: { rejectUnauthorized: boolean };
}

export class EmailService {
  private imap: Imap;
  private config: EmailConfig;

  constructor() {
    this.config = {
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      host: process.env.EMAIL_HOST || 'imap.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };

    this.imap = new Imap(this.config);
  }

  // New method for user-specific email processing
  async checkForReceiptEmailsForUser(userId: string): Promise<{ receiptsAdded: number; message: string }> {
    try {
      // Check if user has email connection
      const connection = await oauthService.getEmailConnection(userId);
      
      if (!connection) {
        // Fall back to demo mode for this user
        return this.runDemoModeForUser(userId);
      }

      // Use Gmail API for OAuth users
      if (connection.emailProvider === 'gmail') {
        return this.processGmailWithOAuth(userId, connection);
      }

      // Use IMAP for other providers
      return this.processWithIMAP(userId, connection);
    } catch (error) {
      console.error('Error checking emails for user:', error);
      throw new Error(`Failed to check emails: ${error}`);
    }
  }

  // Process Gmail using OAuth
  private async processGmailWithOAuth(userId: string, connection: any): Promise<{ receiptsAdded: number; message: string }> {
    try {
      const gmail = await oauthService.getGmailClient(userId);
      
      // Search for unread emails with attachments
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread has:attachment filename:pdf',
        maxResults: 10
      });

      const messages = response.data.messages || [];
      let receiptsAdded = 0;

      for (const message of messages) {
        try {
          const messageData = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!
          });

          const attachments = messageData.data.payload?.parts?.filter(
            (part: any) => part.mimeType === 'application/pdf'
          ) || [];

          for (const attachment of attachments) {
            const attachmentData = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: message.id!,
              id: attachment.body.attachmentId!
            });

            const pdfContent = Buffer.from(attachmentData.data.data!, 'base64');
            await this.processPdfAttachmentForUser(userId, pdfContent, attachment.filename);
            receiptsAdded++;
          }
        } catch (error) {
          console.error('Error processing Gmail message:', error);
        }
      }

      return {
        receiptsAdded,
        message: `Successfully processed ${receiptsAdded} receipt(s) from Gmail`
      };
    } catch (error) {
      console.error('Error processing Gmail with OAuth:', error);
      throw new Error('Failed to process Gmail emails');
    }
  }

  // Process with IMAP (for non-Gmail providers)
  private async processWithIMAP(userId: string, connection: any): Promise<{ receiptsAdded: number; message: string }> {
    // Implementation for IMAP-based email providers
    // This would use the connection.imapHost, imapPort, imapPassword
    throw new Error('IMAP processing not yet implemented');
  }

  // Demo mode for users without email connection
  private async runDemoModeForUser(userId: string): Promise<{ receiptsAdded: number; message: string }> {
    console.log(`Running email processing demo mode for user ${userId}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add sample receipt data for this user
    const sampleReceipts = [
      {
        vendor: 'Starbucks Coffee',
        amount: 24.50,
        category: 'Food & Beverage',
        description: 'Venti Caramel Macchiato and pastry',
        transactionDate: new Date()
      },
      {
        vendor: 'Amazon.com',
        amount: 89.99,
        category: 'Shopping',
        description: 'Wireless headphones purchase',
        transactionDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        vendor: 'Shell Gas Station',
        amount: 45.67,
        category: 'Transportation',
        description: 'Gas fill-up',
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    let addedCount = 0;
    for (const receipt of sampleReceipts) {
      try {
        await prisma.ledgerEntry.create({
          data: {
            userId,
            vendor: receipt.vendor,
            amount: receipt.amount,
            currency: 'USD',
            transactionDate: receipt.transactionDate,
            category: receipt.category,
            description: receipt.description,
            receiptUrl: 'demo-email-processing'
          }
        });
        console.log(`Added demo receipt for user ${userId}: ${receipt.vendor} - $${receipt.amount}`);
        addedCount++;
      } catch (error) {
        console.error('Error adding demo receipt:', error);
      }
    }

    console.log(`Demo mode completed for user ${userId} - added ${addedCount} sample receipts`);
    
    return {
      receiptsAdded: addedCount,
      message: `Demo mode: Added ${addedCount} sample receipts to demonstrate email processing feature`
    };
  }

  // Process PDF attachment for specific user
  private async processPdfAttachmentForUser(userId: string, pdfContent: Buffer, filename: string): Promise<void> {
    try {
      console.log(`Processing PDF for user ${userId}: ${filename}`);

      // Parse PDF content
      const pdfData = await pdf(pdfContent);
      const receiptText = pdfData.text;

      console.log('Extracted text from PDF:', receiptText.substring(0, 200) + '...');

      // Parse receipt with AI
      const parsedReceipt = await parseReceiptWithOpenAI(receiptText);

      // Store in database for this user
      await prisma.ledgerEntry.create({
        data: {
          userId,
          vendor: parsedReceipt.vendor || 'Unknown Vendor',
          amount: parseFloat(parsedReceipt.amount) || 0,
          currency: 'USD',
          transactionDate: new Date(parsedReceipt.transactionDate),
          category: parsedReceipt.category || null,
          description: parsedReceipt.description || null,
          receiptUrl: `email-attachment-${Date.now()}`
        }
      });

      console.log(`Successfully processed and stored receipt from email for user ${userId}`);

    } catch (error) {
      console.error('Error processing PDF attachment:', error);
    }
  }

  // Legacy method for backward compatibility
  async checkForReceiptEmails(): Promise<void> {
    // Check if email credentials are configured at runtime
    const hasCredentials = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    console.log('Email credentials check:', { hasCredentials, user: process.env.EMAIL_USER ? 'configured' : 'not configured' });
    
    if (!hasCredentials) {
      console.log('Email credentials not configured - running in demo mode');
      return this.runDemoMode();
    }

    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err: Error | null, box: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for unread emails with attachments
        this.imap.search(['UNSEEN', 'HEADER', 'Content-Type', 'multipart/mixed'], (err: Error | null, results: number[]) => {
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

          fetch.on('message', (msg: any, seqno: number) => {
            let buffer = '';
            let attachment: any = null;

            msg.on('body', (stream: any, info: any) => {
              stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8');
              });
            });

            msg.once('attributes', (attrs: any) => {
              attachment = attrs.struct;
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                await this.processEmail(parsed, attachment);
              } catch (error) {
                console.error('Error processing email:', error);
              }
            });
          });

          fetch.once('error', (err: Error) => {
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

  private async runDemoMode(): Promise<void> {
    console.log('Running email processing demo mode');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add some sample receipt data to demonstrate the feature
    const sampleReceipts = [
      {
        vendor: 'Starbucks Coffee',
        amount: 24.50,
        category: 'Food & Beverage',
        description: 'Venti Caramel Macchiato and pastry',
        transactionDate: new Date()
      },
      {
        vendor: 'Amazon.com',
        amount: 89.99,
        category: 'Shopping',
        description: 'Wireless headphones purchase',
        transactionDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        vendor: 'Shell Gas Station',
        amount: 45.67,
        category: 'Transportation',
        description: 'Gas fill-up',
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    let addedCount = 0;
    // Add to database
    for (const receipt of sampleReceipts) {
      try {
        await prisma.ledgerEntry.create({
          data: {
            vendor: receipt.vendor,
            amount: receipt.amount,
            currency: 'USD',
            transactionDate: receipt.transactionDate,
            category: receipt.category,
            description: receipt.description,
            receiptUrl: 'demo-email-processing'
          }
        });
        console.log(`Added demo receipt: ${receipt.vendor} - $${receipt.amount}`);
        addedCount++;
      } catch (error) {
        console.error('Error adding demo receipt:', error);
      }
    }

    console.log(`Demo mode completed - added ${addedCount} sample receipts`);
  }

  private async processEmail(email: any, attachment: any): Promise<void> {
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

    } catch (error) {
      console.error('Error processing email:', error);
    }
  }

  private extractPdfAttachments(email: any, attachment: any): any[] {
    const pdfAttachments: any[] = [];

    if (email.attachments && email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        if (attachment.contentType === 'application/pdf') {
          pdfAttachments.push(attachment);
        }
      }
    }

    return pdfAttachments;
  }

  private async processPdfAttachment(attachment: any): Promise<void> {
    try {
      console.log(`Processing PDF: ${attachment.filename}`);

      // Parse PDF content
      const pdfData = await pdf(attachment.content);
      const receiptText = pdfData.text;

      console.log('Extracted text from PDF:', receiptText.substring(0, 200) + '...');

      // Parse receipt with AI
      const parsedReceipt = await parseReceiptWithOpenAI(receiptText);

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

    } catch (error) {
      console.error('Error processing PDF attachment:', error);
    }
  }

  async startMonitoring(): Promise<void> {
    await this.connect();
    
    // Check for emails every 5 minutes
    setInterval(async () => {
      try {
        await this.checkForReceiptEmails();
      } catch (error) {
        console.error('Error checking emails:', error);
      }
    }, 5 * 60 * 1000);

    // Also check immediately
    await this.checkForReceiptEmails();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('Email service connected');
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        console.error('Email connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  disconnect(): void {
    this.imap.end();
  }
}

// Export singleton instance
export const emailService = new EmailService(); 