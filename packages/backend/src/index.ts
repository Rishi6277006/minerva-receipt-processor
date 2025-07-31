import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import { appRouter } from './router';
import { createContext } from './context';
import { PrismaClient } from '@prisma/client';
// import { emailService } from './services/emailService';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Function to seed database with diverse dummy data
async function seedDatabase() {
  try {
    // Check if we already have data
    const existingLedger = await prisma.ledgerEntry.count();
    const existingBank = await prisma.bankTransaction.count();
    
    if (existingLedger > 0 && existingBank > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with dummy data...');

    // Clear existing data
    await prisma.bankTransaction.deleteMany();
    await prisma.ledgerEntry.deleteMany();

    // Create diverse ledger entries
    const ledgerEntries = [
      {
        vendor: "Starbucks Coffee",
        amount: 12.50,
        currency: "USD",
        transactionDate: new Date("2024-01-15"),
        category: "Food & Beverage",
        description: "Venti Caramel Macchiato and blueberry muffin",
        receiptUrl: "starbucks-receipt-001"
      },
      {
        vendor: "Amazon.com",
        amount: 89.99,
        currency: "USD",
        transactionDate: new Date("2024-01-16"),
        category: "Shopping",
        description: "Wireless headphones and phone case",
        receiptUrl: "amazon-receipt-002"
      },
      {
        vendor: "Shell Gas Station",
        amount: 45.67,
        currency: "USD",
        transactionDate: new Date("2024-01-17"),
        category: "Transportation",
        description: "Gas fill-up and car wash",
        receiptUrl: "shell-receipt-003"
      },
      {
        vendor: "Walmart",
        amount: 156.78,
        currency: "USD",
        transactionDate: new Date("2024-01-18"),
        category: "Groceries",
        description: "Weekly grocery shopping - produce, dairy, household items",
        receiptUrl: "walmart-receipt-004"
      },
      {
        vendor: "Netflix",
        amount: 15.99,
        currency: "USD",
        transactionDate: new Date("2024-01-19"),
        category: "Entertainment",
        description: "Monthly subscription - Premium plan",
        receiptUrl: "netflix-receipt-005"
      },
      {
        vendor: "Uber",
        amount: 23.45,
        currency: "USD",
        transactionDate: new Date("2024-01-20"),
        category: "Transportation",
        description: "Ride from downtown to airport",
        receiptUrl: "uber-receipt-006"
      },
      {
        vendor: "Target",
        amount: 67.89,
        currency: "USD",
        transactionDate: new Date("2024-01-21"),
        category: "Shopping",
        description: "Home decor and clothing items",
        receiptUrl: "target-receipt-007"
      },
      {
        vendor: "Chipotle",
        amount: 18.75,
        currency: "USD",
        transactionDate: new Date("2024-01-22"),
        category: "Food & Beverage",
        description: "Burrito bowl with guacamole and chips",
        receiptUrl: "chipotle-receipt-008"
      }
    ];

    // Create diverse bank transactions (some matching, some not)
    const bankTransactions = [
      {
        transactionDate: new Date("2024-01-15"),
        description: "STARBUCKS COFFEE",
        amount: 12.50,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-16"),
        description: "AMAZON.COM",
        amount: 89.99,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-17"),
        description: "SHELL GAS STATION",
        amount: 45.67,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-18"),
        description: "WALMART SUPERCENTER",
        amount: 156.78,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-19"),
        description: "NETFLIX.COM",
        amount: 15.99,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-20"),
        description: "UBER *TRIP",
        amount: 23.45,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-21"),
        description: "TARGET T-1234",
        amount: 67.89,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-22"),
        description: "CHIPOTLE MEXICAN GRILL",
        amount: 18.75,
        type: "DEBIT"
      },
      // Some bank-only transactions (not in ledger)
      {
        transactionDate: new Date("2024-01-23"),
        description: "SPOTIFY USA",
        amount: 9.99,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-24"),
        description: "DOORDASH",
        amount: 34.56,
        type: "DEBIT"
      },
      {
        transactionDate: new Date("2024-01-25"),
        description: "SALARY DEPOSIT",
        amount: 2500.00,
        type: "CREDIT"
      },
      {
        transactionDate: new Date("2024-01-26"),
        description: "APPLE.COM/BILL",
        amount: 2.99,
        type: "DEBIT"
      }
    ];

    // Insert ledger entries
    for (const entry of ledgerEntries) {
      await prisma.ledgerEntry.create({
        data: entry
      });
    }

    // Insert bank transactions
    for (const transaction of bankTransactions) {
      await prisma.bankTransaction.create({
        data: transaction
      });
    }

    console.log(`✅ Seeded database with ${ledgerEntries.length} ledger entries and ${bankTransactions.length} bank transactions`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Backend server listening on port ${PORT}`);
  
  // Seed database with dummy data
  await seedDatabase();
  
  // Start email monitoring if email credentials are provided
  // if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  //   try {
  //     console.log('Starting email monitoring service...');
  //     await emailService.startMonitoring();
  //     console.log('Email monitoring service started successfully');
  //   } catch (error) {
  //     console.error('Failed to start email monitoring:', error);
  //   }
  // } else {
  //   console.log('Email monitoring disabled - no email credentials provided');
  // }
}); 