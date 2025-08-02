'use client';

import { useState } from 'react';

export default function OAuthTest() {
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('https://minerva-receipt-processor-frontend-2jdmzwe4c.vercel.app/api/auth/gmail/callback');
  const [authUrl, setAuthUrl] = useState('');

  const generateAuthUrl = () => {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&response_type=code` +
      `&access_type=offline` +
      `&prompt=consent`;

    setAuthUrl(url);
  };

  const testRedirect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Client ID:</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your Google Client ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Redirect URI:</label>
          <input
            type="text"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter redirect URI"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateAuthUrl}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Auth URL
          </button>
          
          <button
            onClick={testRedirect}
            disabled={!authUrl}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Test Redirect
          </button>
        </div>

        {authUrl && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Generated Auth URL:</label>
            <textarea
              value={authUrl}
              readOnly
              className="w-full h-32 p-2 border rounded bg-gray-50"
            />
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside mt-2 text-sm text-yellow-700">
            <li>Enter your Google Client ID from Vercel environment variables</li>
            <li>Make sure the redirect URI matches what's configured in Google Cloud Console</li>
            <li>Generate the auth URL and test the redirect</li>
            <li>Check the browser console for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 