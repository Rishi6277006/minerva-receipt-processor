'use client';

import { useState } from 'react';

export default function OAuthSimple() {
  const [isLoading, setIsLoading] = useState(false);

  const connectGmail = async () => {
    setIsLoading(true);
    
    try {
      // Get the current domain
      const currentDomain = window.location.origin;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        alert('❌ Google OAuth not configured');
        return;
      }

      // Create OAuth URL with current domain
      const redirectUri = `${currentDomain}/oauth-simple/callback`;
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ];

      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&response_type=code` +
        `&access_type=offline` +
        `&prompt=consent`;

      console.log('Current Domain:', currentDomain);
      console.log('Redirect URI:', redirectUri);
      console.log('OAuth URL:', authUrl);

      // Show the URL first
      alert(`OAuth URL:\n\n${authUrl}\n\nRedirect URI: ${redirectUri}\n\nClick OK to proceed to Google OAuth.`);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Simple OAuth Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-800">Current Domain:</h3>
          <p className="text-blue-600">{typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-medium text-green-800">Redirect URI:</h3>
          <p className="text-green-600">
            {typeof window !== 'undefined' ? `${window.location.origin}/oauth-simple/callback` : 'Loading...'}
          </p>
        </div>

        <button
          onClick={connectGmail}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Connecting...' : 'Connect Gmail (Simple Test)'}
        </button>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside mt-2 text-sm text-yellow-700">
            <li>Add this redirect URI to Google Cloud Console: <code className="bg-yellow-100 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/oauth-simple/callback` : 'Loading...'}</code></li>
            <li>Click the button above</li>
            <li>You should see the Google OAuth consent screen</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 