import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { parseReceiptWithOpenAI } from './services/openaiService';
import { ImageService } from './services/imageService';
import multer from 'multer';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { emailService } from './services/emailService';

const t = initTRPC.context<Context>().create();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const appRouter = t.router({
  ledger: t.router({
    getAll: t.procedure.query(async ({ ctx }) => {
      return await ctx.prisma.ledgerEntry.findMany({
        orderBy: { transactionDate: 'desc' }
      });
    }),

    addEntry: t.procedure
      .input(z.object({
        vendor: z.string(),
        amount: z.number(),
        currency: z.string().default('USD'),
        transactionDate: z.string(),
        category: z.string().optional(),
        description: z.string().optional(),
        receiptUrl: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.ledgerEntry.create({
          data: {
            ...input,
            transactionDate: new Date(input.transactionDate)
          }
        });
      })
  }),

  receipt: t.router({
    parseAndAdd: t.procedure
      .input(z.object({
        receiptText: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const parsedReceipt = await parseReceiptWithOpenAI(input.receiptText);
          
          const entry = await ctx.prisma.ledgerEntry.create({
            data: {
              vendor: parsedReceipt.vendor || 'Unknown Vendor',
              amount: parseFloat(parsedReceipt.amount) || 0,
              currency: 'USD',
              transactionDate: new Date(parsedReceipt.transactionDate),
              category: parsedReceipt.category || null,
              description: parsedReceipt.description || null,
              receiptUrl: 'manual-input'
            }
          });

          return entry;
        } catch (error) {
          throw new Error(`Failed to parse receipt: ${error}`);
        }
      }),
    uploadImage: t.procedure
      .input(z.object({
        imageData: z.string().refine((data) => {
          // Accept both base64 data URLs and raw base64 strings
          return data.startsWith('data:image/') || /^[A-Za-z0-9+/]*={0,2}$/.test(data);
        }, {
          message: "Image data must be a valid base64 string or data URL"
        }),
        filename: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Convert base64 to buffer - handle both data URLs and raw base64
          let base64Data = input.imageData;
          if (base64Data.startsWith('data:image/')) {
            // Extract base64 data from data URL
            base64Data = base64Data.split(',')[1];
          }
          
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Process the image
          const result = await ImageService.processReceiptImage(imageBuffer, input.filename);
          
          return {
            success: true,
            entry: result.entry,
            extractedText: result.extractedText,
            parsedReceipt: result.parsedReceipt
          };
        } catch (error) {
          throw new Error(`Failed to process receipt image: ${error}`);
        }
      }),
  }),

  bank: t.router({
    getAll: t.procedure.query(async ({ ctx }) => {
      try {
        const transactions = await ctx.prisma.bankTransaction.findMany({
          orderBy: { transactionDate: 'desc' }
        });
        return transactions;
      } catch (error) {
        throw new Error(`Failed to fetch bank transactions: ${error}`);
      }
    }),

    uploadStatement: t.procedure
      .input(z.object({ // Changed input to accept csvData string
        csvData: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          console.log('Backend received CSV data length:', input.csvData.length);
          console.log('Backend received CSV data preview:', input.csvData.substring(0, 200));
          console.log('Full CSV data:', input.csvData);
          
          const lines = input.csvData.split('\n').filter(line => line.trim() !== '');
          console.log('CSV lines after filtering:', lines);
          console.log('Number of lines:', lines.length);
          
          if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          console.log('Found headers:', headers);
          console.log('Raw header line:', lines[0]);
          
          // More flexible column detection
          const dateIndex = headers.findIndex(h => 
            h.includes('date') || h.includes('transaction_date') || h.includes('trans_date')
          );
          const descriptionIndex = headers.findIndex(h => 
            h.includes('description') || h.includes('desc') || h.includes('memo') || h.includes('note') || h.includes('details')
          );
          const amountIndex = headers.findIndex(h => 
            h.includes('amount') || h.includes('amt') || h.includes('sum') || h.includes('total')
          );
          const typeIndex = headers.findIndex(h => 
            h.includes('type') || h.includes('transaction_type') || h.includes('category')
          );
          const depositsIndex = headers.findIndex(h => 
            h.includes('deposits') || h.includes('deposit') || h.includes('credit')
          );
          const withdrawalsIndex = headers.findIndex(h => 
            h.includes('withdrawls') || h.includes('withdrawals') || h.includes('withdrawal') || h.includes('debit')
          );

          console.log('Column indices:', { dateIndex, descriptionIndex, depositsIndex, withdrawalsIndex, amountIndex, typeIndex });
          console.log('Processing CSV with format: Amount + Type (preferred)');

          if (dateIndex === -1) {
            throw new Error('CSV must contain a Date column (found headers: ' + headers.join(', ') + ')');
          }
          if (descriptionIndex === -1) {
            throw new Error('CSV must contain a Description column (found headers: ' + headers.join(', ') + ')');
          }
          if (amountIndex === -1 && depositsIndex === -1 && withdrawalsIndex === -1) {
            throw new Error('CSV must contain an Amount, Deposits, or Withdrawals column (found headers: ' + headers.join(', ') + ')');
          }

          const transactions: any[] = [];
                 
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle quoted CSV values
            const values = line.split(',').map(v => {
              const trimmed = v.trim();
              // Remove quotes if present
              return trimmed.replace(/^["']|["']$/g, '');
            });
            
            const date = values[dateIndex];
            const description = values[descriptionIndex];
            const deposits = depositsIndex !== -1 ? values[depositsIndex] : '0';
            const withdrawals = withdrawalsIndex !== -1 ? values[withdrawalsIndex] : '0';
            const amount = amountIndex !== -1 ? values[amountIndex] : null;
            const type = typeIndex !== -1 ? values[typeIndex] : null;

            // Validate required fields
            if (!date || !description) {
              console.log('Skipping invalid row:', { date, description });
              continue;
            }

            console.log('Processing row:', { date, description, amount, type });

            // Parse date - handle different formats
            let transactionDate: Date;
            try {
              // Try different date formats
              if (date.includes('-')) {
                transactionDate = new Date(date);
              } else if (date.includes('/')) {
                // Handle MM/DD/YYYY format
                const parts = date.split('/');
                if (parts.length === 3) {
                  transactionDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                } else {
                  transactionDate = new Date(date);
                }
              } else {
                transactionDate = new Date(date);
              }
              
              if (isNaN(transactionDate.getTime())) {
                console.log('Invalid date:', date);
                continue;
              }
            } catch (error) {
              console.log('Error parsing date:', date);
              continue;
            }

            // Process deposits
            if (deposits && deposits !== '0') {
              try {
                const depositAmount = parseFloat(deposits.replace(/[$,€£¥]/g, ''));
                if (!isNaN(depositAmount) && depositAmount > 0) {
                  const transaction = await ctx.prisma.bankTransaction.create({
                    data: {
                      description: `${description} (Deposit)`,
                      amount: depositAmount,
                      transactionDate,
                      type: 'CREDIT',
                      sourceFile: 'uploaded-csv'
                    }
                  });
                  transactions.push(transaction);
                }
              } catch (error) {
                console.log('Error parsing deposit amount:', deposits);
              }
            }

            // Process withdrawals
            if (withdrawals && withdrawals !== '0') {
              try {
                const withdrawalAmount = parseFloat(withdrawals.replace(/[$,€£¥]/g, ''));
                if (!isNaN(withdrawalAmount) && withdrawalAmount > 0) {
                  const transaction = await ctx.prisma.bankTransaction.create({
                    data: {
                      description: `${description} (Withdrawal)`,
                      amount: withdrawalAmount,
                      transactionDate,
                      type: 'DEBIT',
                      sourceFile: 'uploaded-csv'
                    }
                  });
                  transactions.push(transaction);
                }
              } catch (error) {
                console.log('Error parsing withdrawal amount:', withdrawals);
              }
            }

            // Process single amount with type (preferred format)
            if (amount && amountIndex !== -1) {
              try {
                const cleanAmount = amount.replace(/[$,€£¥]/g, '');
                const transactionAmount = parseFloat(cleanAmount);
                if (!isNaN(transactionAmount)) {
                  // Use type from CSV if available, otherwise infer from amount
                  let transactionType = type || (transactionAmount < 0 ? 'DEBIT' : 'CREDIT');
                  
                  // Normalize type values
                  if (transactionType.toUpperCase().includes('DEBIT') || transactionType.toUpperCase().includes('WITHDRAWAL')) {
                    transactionType = 'DEBIT';
                  } else if (transactionType.toUpperCase().includes('CREDIT') || transactionType.toUpperCase().includes('DEPOSIT')) {
                    transactionType = 'CREDIT';
                  }
                  
                  const transaction = await ctx.prisma.bankTransaction.create({
                    data: {
                      description,
                      amount: Math.abs(transactionAmount),
                      transactionDate,
                      type: transactionType,
                      sourceFile: 'uploaded-csv'
                    }
                  });
                  transactions.push(transaction);
                }
              } catch (error) {
                console.log('Error parsing amount:', amount);
              }
            }
          }
          
          console.log(`Successfully processed ${transactions.length} transactions`);
          
          if (transactions.length === 0) {
            throw new Error('No transactions found in CSV - check column mapping and data format');
          }
          
          return { 
            message: 'Bank statement uploaded successfully',
            transactionsCount: transactions.length,
            transactions
          };
        } catch (error) {
          console.error('CSV processing error:', error);
          throw new Error(`Failed to process CSV: ${error}`);
        }
      }),

    getTransactions: t.procedure.query(async ({ ctx }) => {
      return await ctx.prisma.bankTransaction.findMany({
        orderBy: { transactionDate: 'desc' }
      });
    })
  }),

  email: t.router({
    checkForReceipts: t.procedure.mutation(async () => {
      try {
        await emailService.checkForReceiptEmails();
        return { message: 'Email check completed successfully' };
      } catch (error) {
        throw new Error(`Failed to check emails: ${error}`);
      }
    }),

    getStatus: t.procedure.query(() => {
      return {
        enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        host: process.env.EMAIL_HOST || 'Not configured',
        user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'Not configured'
      };
    })
  }),

  comparison: t.router({
    compare: t.procedure.query(async ({ ctx }) => {
      const ledgerEntries = await ctx.prisma.ledgerEntry.findMany();
      const bankTransactions = await ctx.prisma.bankTransaction.findMany();

      const matched: Array<{ ledger: any; bank: any }> = [];
      const ledgerOnly = [...ledgerEntries];
      const bankOnly = [...bankTransactions];

      // Simple matching logic: amount and date (within 1 day tolerance)
      ledgerEntries.forEach((ledger: any) => {
        const matchingBankTxIndex = bankOnly.findIndex((bank: any) =>
          Math.abs(ledger.amount - bank.amount) < 0.01 && // Amount tolerance
          Math.abs(ledger.transactionDate.getTime() - bank.transactionDate.getTime()) < (24 * 60 * 60 * 1000) // 1 day tolerance
        );

        if (matchingBankTxIndex !== -1) {
          const matchingBankTx = bankOnly[matchingBankTxIndex];
          matched.push({ ledger, bank: matchingBankTx });
          
          // Remove from "only" arrays
          const ledgerIndex = ledgerOnly.findIndex((l: any) => l.id === ledger.id);
          if (ledgerIndex !== -1) ledgerOnly.splice(ledgerIndex, 1);
          bankOnly.splice(matchingBankTxIndex, 1);
        }
      });

      return {
        matched,
        ledgerOnly,
        bankOnly
      };
    })
  })
});

export type AppRouter = typeof appRouter; 