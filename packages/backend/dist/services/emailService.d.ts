export declare class EmailService {
    private imap;
    private config;
    constructor();
    connect(): Promise<void>;
    checkForReceiptEmails(): Promise<void>;
    private processEmail;
    private extractPdfAttachments;
    private processPdfAttachment;
    startMonitoring(): Promise<void>;
    disconnect(): void;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map