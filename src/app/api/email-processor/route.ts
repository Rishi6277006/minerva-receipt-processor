import { NextRequest, NextResponse } from 'next/server';
import * as Imap from 'node-imap';

// REAL email processing using IMAP to connect to actual email servers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    console.log('Processing REAL emails for:', email);

    // Get email server settings
    const emailConfig = getEmailServerConfig(email);
    
    if (!emailConfig) {
      return NextResponse.json({ 
        error: 'Unsupported email provider. Please use Gmail, Outlook, or Yahoo.' 
      }, { status: 400 });
    }

    // Connect to real email server and process emails
    const realReceipts = await connectAndProcessEmails(email, password, emailConfig);

    return NextResponse.json({
      success: true,
      email: email,
      receiptsFound: realReceipts.length,
      receipts: realReceipts,
      message: `Successfully processed ${realReceipts.length} receipt emails from ${email}`,
      realData: true
    });

  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json({ 
      error: 'Email processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getEmailServerConfig(email: string) {
  if (email.includes('@gmail.com')) {
    return {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      provider: 'gmail',
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };
  }
  if (email.includes('@outlook.com') || email.includes('@hotmail.com')) {
    return {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
      provider: 'outlook',
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };
  }
  if (email.includes('@yahoo.com')) {
    return {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
      provider: 'yahoo',
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };
  }
  return null;
}

async function connectAndProcessEmails(email: string, password: string, config: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to ${config.provider} server for ${email}...`);
    
    const imap = new (Imap as any)({
      user: email,
      password: password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: config.tlsOptions,
      connTimeout: 60000,
      authTimeout: 5000,
    });

    const receipts: any[] = [];

    imap.once('ready', () => {
      console.log('Connected to email server successfully');
      
      imap.openBox('INBOX', false, (err: any, box: any) => {
        if (err) {
          console.error('Error opening inbox:', err);
          imap.end();
          reject(err);
          return;
        }

        console.log('Opened inbox, searching for receipt emails...');

        // Search for emails with receipt-related subjects
        const searchCriteria = [
          ['SUBJECT', 'receipt'],
          ['OR'],
          ['SUBJECT', 'invoice'],
          ['OR'],
          ['SUBJECT', 'order'],
          ['OR'],
          ['SUBJECT', 'confirmation'],
          ['OR'],
          ['FROM', 'amazon'],
          ['OR'],
          ['FROM', 'starbucks'],
          ['OR'],
          ['FROM', 'uber'],
          ['OR'],
          ['FROM', 'netflix'],
          ['OR'],
          ['FROM', 'spotify']
        ];

        imap.search(searchCriteria, (err: any, results: any) => {
          if (err) {
            console.error('Error searching emails:', err);
            imap.end();
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('No receipt emails found');
            imap.end();
            resolve([]);
            return;
          }

          console.log(`Found ${results.length} potential receipt emails`);

          // Limit to first 10 emails for demo
          const emailsToProcess = results.slice(0, 10);

          const fetch = imap.fetch(emailsToProcess, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: true
          });

          fetch.on('message', (msg: any, seqno: any) => {
            console.log(`Processing email ${seqno}`);
            
            let buffer = '';
            let header = '';
            let attributes: any = {};

            msg.on('body', (stream: any, info: any) => {
              if (info.which === 'TEXT') {
                stream.on('data', (chunk: any) => {
                  buffer += chunk.toString('utf8');
                });
              } else {
                stream.on('data', (chunk: any) => {
                  header += chunk.toString('utf8');
                });
              }
            });

            msg.once('attributes', (attrs: any) => {
              attributes = attrs;
            });

            msg.once('end', () => {
              // Parse email headers
              const fromMatch = header.match(/From: (.+)/i);
              const subjectMatch = header.match(/Subject: (.+)/i);
              const dateMatch = header.match(/Date: (.+)/i);

              const from = fromMatch ? fromMatch[1].trim() : 'Unknown';
              const subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';
              const date = dateMatch ? new Date(dateMatch[1].trim()) : new Date();

              // Check if this looks like a receipt
              const isReceipt = subject.toLowerCase().includes('receipt') ||
                               subject.toLowerCase().includes('invoice') ||
                               subject.toLowerCase().includes('order') ||
                               subject.toLowerCase().includes('confirmation') ||
                               from.toLowerCase().includes('amazon') ||
                               from.toLowerCase().includes('starbucks') ||
                               from.toLowerCase().includes('uber') ||
                               from.toLowerCase().includes('netflix') ||
                               from.toLowerCase().includes('spotify');

              if (isReceipt) {
                // Extract amount from email content or subject
                const amountMatch = buffer.match(/\$(\d+\.?\d*)/) || subject.match(/\$(\d+\.?\d*)/);
                const amount = amountMatch ? `$${amountMatch[1]}` : '$0.00';

                // Determine merchant from sender
                let merchant = 'Unknown';
                if (from.toLowerCase().includes('amazon')) merchant = 'Amazon';
                else if (from.toLowerCase().includes('starbucks')) merchant = 'Starbucks';
                else if (from.toLowerCase().includes('uber')) merchant = 'Uber';
                else if (from.toLowerCase().includes('netflix')) merchant = 'Netflix';
                else if (from.toLowerCase().includes('spotify')) merchant = 'Spotify';

                // Determine category
                let category = 'Other';
                if (merchant === 'Amazon') category = 'Shopping';
                else if (merchant === 'Starbucks') category = 'Food & Dining';
                else if (merchant === 'Uber') category = 'Transportation';
                else if (merchant === 'Netflix' || merchant === 'Spotify') category = 'Entertainment';

                const receipt = {
                  id: `email_${seqno}`,
                  subject: subject,
                  sender: from,
                  date: date.toISOString(),
                  amount: amount,
                  merchant: merchant,
                  category: category,
                  hasPdf: false, // We'll check for attachments later
                  pdfContent: '',
                  extractedData: {
                    total: parseFloat(amount.replace('$', '')),
                    tax: 0,
                    items: [subject],
                    transactionId: `EMAIL_${seqno}`
                  },
                  realEmail: true
                };

                receipts.push(receipt);
                console.log(`Found receipt: ${subject} - ${amount}`);
              }
            });
          });

          fetch.once('error', (err: any) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`Finished processing ${receipts.length} receipt emails`);
            imap.end();
            resolve(receipts);
          });
        });
      });
    });

    imap.once('error', (err: any) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
} 