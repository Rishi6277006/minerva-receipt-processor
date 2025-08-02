import { google } from 'googleapis';
import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'minerva-oauth-key-2024';

export class OAuthService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL for user to authorize
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get access and refresh tokens');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 3600
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Encrypt sensitive data
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Store user's email connection
  async storeEmailConnection(
    userId: string,
    emailAddress: string,
    tokens: { access_token: string; refresh_token: string; expires_in: number }
  ): Promise<void> {
    try {
      // Encrypt tokens before storing
      const encryptedAccessToken = this.encrypt(tokens.access_token);
      const encryptedRefreshToken = this.encrypt(tokens.refresh_token);
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await prisma.userEmailConnection.upsert({
        where: {
          userId_emailProvider: {
            userId,
            emailProvider: 'gmail'
          }
        },
        update: {
          emailAddress,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          emailProvider: 'gmail',
          emailAddress,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          isActive: true
        }
      });

      console.log(`Stored email connection for user ${userId} with email ${emailAddress}`);
    } catch (error) {
      console.error('Error storing email connection:', error);
      throw new Error('Failed to store email connection');
    }
  }

  // Get user's email connection
  async getEmailConnection(userId: string): Promise<any> {
    try {
      const connection = await prisma.userEmailConnection.findUnique({
        where: {
          userId_emailProvider: {
            userId,
            emailProvider: 'gmail'
          }
        }
      });

      if (!connection || !connection.isActive) {
        return null;
      }

      // Decrypt tokens
      return {
        ...connection,
        accessToken: connection.accessToken ? this.decrypt(connection.accessToken) : null,
        refreshToken: connection.refreshToken ? this.decrypt(connection.refreshToken) : null
      };
    } catch (error) {
      console.error('Error getting email connection:', error);
      return null;
    }
  }

  // Refresh access token if expired
  async refreshAccessToken(userId: string): Promise<string | null> {
    try {
      const connection = await this.getEmailConnection(userId);
      
      if (!connection || !connection.refreshToken) {
        return null;
      }

      // Check if token is expired
      if (connection.expiresAt && connection.expiresAt > new Date()) {
        return connection.accessToken; // Token is still valid
      }

      // Refresh the token
      this.oauth2Client.setCredentials({
        refresh_token: connection.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update stored tokens
      await this.storeEmailConnection(userId, connection.emailAddress, {
        access_token: credentials.access_token,
        refresh_token: connection.refreshToken,
        expires_in: credentials.expires_in || 3600
      });

      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  // Get Gmail API client for user
  async getGmailClient(userId: string): Promise<any> {
    try {
      const accessToken = await this.refreshAccessToken(userId);
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      return google.gmail({ version: 'v1', auth: this.oauth2Client });
    } catch (error) {
      console.error('Error getting Gmail client:', error);
      throw new Error('Failed to get Gmail client');
    }
  }

  // Disconnect user's email
  async disconnectEmail(userId: string): Promise<void> {
    try {
      await prisma.userEmailConnection.update({
        where: {
          userId_emailProvider: {
            userId,
            emailProvider: 'gmail'
          }
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`Disconnected email for user ${userId}`);
    } catch (error) {
      console.error('Error disconnecting email:', error);
      throw new Error('Failed to disconnect email');
    }
  }
}

export const oauthService = new OAuthService(); 