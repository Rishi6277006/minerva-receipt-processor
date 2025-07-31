import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { parseReceiptWithOpenAI } from './openaiService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ImageService {
  /**
   * Process an uploaded receipt image
   */
  static async processReceiptImage(imageBuffer: Buffer, filename: string) {
    try {
      console.log(`Processing receipt image: ${filename}`);
      
      // Preprocess the image for better OCR
      const processedImageBuffer = await this.preprocessImage(imageBuffer);
      
      // Extract text using OCR
      const extractedText = await this.extractTextFromImage(processedImageBuffer);
      
      console.log('Extracted text from image:', extractedText.substring(0, 200) + '...');
      
      // Parse the extracted text using AI
      const parsedReceipt = await parseReceiptWithOpenAI(extractedText);
      
      // Store in database
      const entry = await prisma.ledgerEntry.create({
        data: {
          vendor: parsedReceipt.vendor || 'Unknown Vendor',
          amount: parseFloat(parsedReceipt.amount) || 0,
          currency: 'USD',
          transactionDate: new Date(parsedReceipt.transactionDate),
          category: parsedReceipt.category || null,
          description: parsedReceipt.description || null,
          receiptUrl: `image-upload-${Date.now()}-${filename}`
        }
      });
      
      console.log('Successfully processed and stored receipt from image');
      
      return {
        success: true,
        entry,
        extractedText,
        parsedReceipt
      };
      
    } catch (error) {
      console.error('Error processing receipt image:', error);
      throw new Error(`Failed to process receipt image: ${error}`);
    }
  }
  
  /**
   * Preprocess image for better OCR results
   */
  private static async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Convert to grayscale, enhance contrast, and resize if needed
      const processedBuffer = await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .sharpen()
        .resize(2000, 2000, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .png()
        .toBuffer();
      
      return processedBuffer;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      // Return original buffer if preprocessing fails
      return imageBuffer;
    }
  }
  
  /**
   * Extract text from image using OCR
   */
  private static async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await Tesseract.recognize(
        imageBuffer,
        'eng',
        {
          logger: m => console.log('OCR Progress:', m.progress * 100, '%')
        }
      );
      
      return result.data.text;
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }
  
  /**
   * Get supported image formats
   */
  static getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];
  }
  
  /**
   * Validate image file
   */
  static validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedFormats = this.getSupportedFormats();
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Image file too large. Maximum size is 10MB.' };
    }
    
    if (!supportedFormats.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: `Unsupported image format. Supported formats: ${supportedFormats.join(', ')}` 
      };
    }
    
    return { valid: true };
  }
} 