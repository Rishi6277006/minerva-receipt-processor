import OpenAI from 'openai';

// Only initialize OpenAI if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
}

export async function parseReceiptWithOpenAI(receiptText: string) {
  console.log('Parsing receipt text:', receiptText.substring(0, 200) + '...');
  
  // If OpenAI is not available, use basic parsing
  if (!openai) {
    console.log('OpenAI not configured, using basic parsing');
    return parseReceiptBasic(receiptText);
  }

  const prompt = `You are an expert receipt parser. Extract the following details from this receipt text in JSON format:

IMPORTANT: Look for the FINAL TOTAL or GRAND TOTAL amount, not individual line items. The amount should be the total amount paid.

Fields to extract:
- vendor: The store/restaurant name (usually at the top)
- amount: The FINAL TOTAL amount paid (look for "Total:", "Grand Total:", "Amount Due:", etc.)
- transactionDate: Date in YYYY-MM-DD format
- category: One of: Food & Beverage, Shopping, Transportation, Groceries, Entertainment, Home, General
- description: Brief description of items purchased

Rules:
1. For amount: Find the FINAL TOTAL, not individual items
2. For vendor: Use the business name, not address or phone
3. For date: Convert any date format to YYYY-MM-DD
4. If a field is unclear, use null

Receipt text:
${receiptText}

Return only valid JSON with these exact field names.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o',
    response_format: { type: "json_object" },
  });

  const content = chatCompletion.choices[0].message.content;
  if (content) {
    console.log('OpenAI response:', content);
    const parsed = JSON.parse(content);
    console.log('Parsed result:', parsed);
    return parsed;
  } else {
    throw new Error("Failed to parse receipt with OpenAI");
  }
}

export async function parseCSVWithOpenAI(csvData: string) {
  console.log('Parsing CSV data:', csvData.substring(0, 200) + '...');
  
  // If OpenAI is not available, use basic parsing
  if (!openai) {
    console.log('OpenAI not configured, using basic CSV parsing');
    return parseCSVBasic(csvData);
  }

  const prompt = `You are an expert bank statement parser. Parse this CSV data and extract all financial transactions in JSON format.

CSV Data:
${csvData}

Instructions:
1. Parse each row as a separate transaction
2. Handle different CSV formats including:
   - Single "Amount" column with "Type" column
   - Separate "Deposits" and "Withdrawls" columns
   - Any other bank statement format
3. Extract: date, description, amount, type (DEBIT/CREDIT)
4. Clean and normalize the data
5. Return an array of transaction objects

Rules:
- For amount: Remove currency symbols and convert to number
- For date: Convert to YYYY-MM-DD format (handle DD-Mon-YYYY format)
- For type: 
  * If there's a "Type" column, use it directly
  * If there are separate "Deposits" and "Withdrawls" columns:
    - Use Deposits amount for CREDIT transactions
    - Use Withdrawls amount for DEBIT transactions
    - Skip rows where both are 0
- For description: Clean up the text, remove extra spaces
- Skip header rows and empty rows
- Handle date formats like "20-Aug-2020" → "2020-08-20"

Return a JSON array with this structure:
[
  {
    "date": "2020-08-20",
    "description": "Cheque",
    "amount": 3391.02,
    "type": "CREDIT"
  },
  {
    "date": "2020-08-21", 
    "description": "ATM",
    "amount": 82961.17,
    "type": "DEBIT"
  }
]

Return only valid JSON array.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o',
    response_format: { type: "json_object" },
  });

  const content = chatCompletion.choices[0].message.content;
  if (content) {
    console.log('OpenAI CSV response:', content);
    const parsed = JSON.parse(content);
    console.log('Parsed CSV result:', parsed);
    return parsed;
  } else {
    throw new Error("Failed to parse CSV with OpenAI");
  }
}

// Basic parser for when OpenAI is not available
function parseReceiptBasic(receiptText: string) {
  const lines = receiptText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let vendor = 'Unknown Vendor';
  let amount = 0;
  let transactionDate = new Date().toISOString().split('T')[0];
  let category = 'General';
  let description = '';

  // Extract amount - look for FINAL TOTAL patterns
  const amountPatterns = [
    /Total[:\s]*\$?(\d+\.?\d*)/i,
    /Grand Total[:\s]*\$?(\d+\.?\d*)/i,
    /Amount Due[:\s]*\$?(\d+\.?\d*)/i,
    /Final Total[:\s]*\$?(\d+\.?\d*)/i,
    /AMOUNT\s+(\d+\.?\d*)/i,
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
  const itemLines = lines.filter(line => 
    line.includes('$') || 
    line.match(/\d+\.\d{2}/) ||
    line.includes('Loren') || line.includes('psun') || line.includes('Dolor')
  );
  
  if (itemLines.length > 0) {
    description = itemLines.slice(0, 3).join(', ');
  }

  // Determine category based on vendor or description
  const vendorLower = vendor.toLowerCase();
  const descLower = description.toLowerCase();
  
  if (vendorLower.includes('grocery') || vendorLower.includes('food') || vendorLower.includes('market') || 
      descLower.includes('food') || descLower.includes('grocery')) {
    category = 'Food';
  } else if (vendorLower.includes('gas') || vendorLower.includes('fuel') || vendorLower.includes('station')) {
    category = 'Transport';
  } else if (vendorLower.includes('pharmacy') || vendorLower.includes('drug')) {
    category = 'Healthcare';
  } else if (vendorLower.includes('restaurant') || vendorLower.includes('cafe') || vendorLower.includes('diner')) {
    category = 'Dining';
  } else {
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

// Basic CSV parser for when OpenAI is not available
function parseCSVBasic(csvData: string) {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  const transactions = [];
  
  if (lines.length < 2) {
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log('Basic parser headers:', headers);
  
  // Check if we have separate deposits/withdrawals columns
  const hasDeposits = headers.some(h => h.includes('deposit'));
  const hasWithdrawals = headers.some(h => h.includes('withdrawal') || h.includes('withdrawl'));
  
  if (hasDeposits && hasWithdrawals) {
    // Handle separate deposits/withdrawals format
    const dateIndex = headers.findIndex(h => h.includes('date'));
    const descIndex = headers.findIndex(h => h.includes('description') || h.includes('desc'));
    const depositsIndex = headers.findIndex(h => h.includes('deposit'));
    const withdrawalsIndex = headers.findIndex(h => h.includes('withdrawal') || h.includes('withdrawl'));
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      if (values.length < Math.max(dateIndex, descIndex, depositsIndex, withdrawalsIndex) + 1) continue;
      
      const date = values[dateIndex];
      const description = values[descIndex];
      const deposits = parseFloat(values[depositsIndex]?.replace(/[$,]/g, '') || '0');
      const withdrawals = parseFloat(values[withdrawalsIndex]?.replace(/[$,]/g, '') || '0');
      
      // Handle deposits (CREDIT)
      if (!isNaN(deposits) && deposits > 0 && date && description) {
        transactions.push({
          date: convertDate(date),
          description,
          amount: deposits,
          type: 'CREDIT'
        });
      }
      
      // Handle withdrawals (DEBIT)
      if (!isNaN(withdrawals) && withdrawals > 0 && date && description) {
        transactions.push({
          date: convertDate(date),
          description,
          amount: withdrawals,
          type: 'DEBIT'
        });
      }
    }
  } else {
    // Handle single amount column format
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      if (values.length < 3) continue;
      
      const date = values[0];
      const description = values[1];
      const amount = parseFloat(values[2].replace(/[$,]/g, ''));
      const type = values[3] || 'DEBIT';
      
      if (!isNaN(amount) && amount > 0 && date && description) {
        transactions.push({
          date: convertDate(date),
          description,
          amount,
          type: type.toUpperCase()
        });
      }
    }
  }
  
  return transactions;
}

// Helper function to convert various date formats
function convertDate(dateStr: string): string {
  // Handle DD-Mon-YYYY format (e.g., "20-Aug-2020")
  const monthMap: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  
  const match = dateStr.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = monthMap[match[2].toLowerCase()] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // Try standard date parsing
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
} 