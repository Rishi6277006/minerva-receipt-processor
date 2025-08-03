'use client';

import { useEffect, useState } from 'react';

export default function OAuthCallback() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const authError = urlParams.get('error');
    
    if (authCode) {
      setCode(authCode);
    } else if (authError) {
      setError(authError);
    } else {
      setError('No authorization code or error received');
    }
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Callback</h1>
      
      {code && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800">✅ OAuth Success!</h3>
            <p className="text-green-600">Authorization code received successfully.</p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-800">Authorization Code:</h3>
            <code className="block mt-2 p-2 bg-blue-100 rounded text-sm break-all">
              {code}
            </code>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800">🎉 OAuth is Working!</h3>
            <p className="text-yellow-700">
              This proves that Google OAuth is working correctly. The authorization code above 
              can be exchanged for access tokens to access Gmail.
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-medium text-red-800">❌ OAuth Error</h3>
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
      
      <div className="mt-6">
        <a 
          href="/oauth-simple" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to OAuth Test
        </a>
      </div>
    </div>
  );
} 