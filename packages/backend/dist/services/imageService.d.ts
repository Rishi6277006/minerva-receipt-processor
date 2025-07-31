export declare class ImageService {
    /**
     * Process an uploaded receipt image
     */
    static processReceiptImage(imageBuffer: Buffer, filename: string): Promise<{
        success: boolean;
        entry: {
            id: string;
            vendor: string;
            amount: number;
            currency: string;
            transactionDate: Date;
            category: string | null;
            description: string | null;
            receiptUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        extractedText: string;
        parsedReceipt: any;
    }>;
    /**
     * Preprocess image for better OCR results
     */
    private static preprocessImage;
    /**
     * Extract text from image using OCR
     */
    private static extractTextFromImage;
    /**
     * Get supported image formats
     */
    static getSupportedFormats(): string[];
    /**
     * Validate image file
     */
    static validateImage(file: Express.Multer.File): {
        valid: boolean;
        error?: string;
    };
}
//# sourceMappingURL=imageService.d.ts.map