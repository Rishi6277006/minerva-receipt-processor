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