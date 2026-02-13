'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface PromptData {
  agent: {
    id: string;
    name: string;
    business_name: string;
    business_type: string;
  };
  prompt: {
    id: string;
    version_number: number;
    compiled_prompt: string;
    token_count: number;
    created_at: string;
  };
}

export default function PromptPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [data, setData] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrompt() {
      try {
        const response = await fetch(`/api/agents/${agentId}/prompt`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load prompt');
        }
      } catch (err) {
        console.error('Error loading prompt:', err);
        setError('Failed to load prompt');
      } finally {
        setLoading(false);
      }
    }

    loadPrompt();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Prompt not found'}</p>
          <a href="/" className="mt-6 inline-block text-blue-600 hover:text-blue-700">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{data.agent.business_name}</h1>
          <p className="mt-2 text-gray-600">
            Voice Agent Prompt • Version {data.prompt.version_number} • {data.prompt.token_count} tokens
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Prompt Generated Successfully!</h3>
              <p className="mt-1 text-green-700">
                Claude has created a production-ready voice agent prompt for your business. Review it below.
              </p>
            </div>
          </div>
        </div>

        {/* Prompt Display */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Prompt</h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Copy Prompt
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Test with Voice
              </button>
            </div>
          </div>

          {/* Prompt Content */}
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                {data.prompt.compiled_prompt}
              </pre>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Version</dt>
                <dd className="mt-1 text-gray-900">v{data.prompt.version_number}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Token Count</dt>
                <dd className="mt-1 text-gray-900">{data.prompt.token_count} words</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Generated</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(data.prompt.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Draft
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Next Steps</h3>
          <ol className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mr-3">1</span>
              <span>Review the generated prompt above</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mr-3">2</span>
              <span>Test it with voice or text role-play</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mr-3">3</span>
              <span>Give feedback to improve the prompt automatically</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mr-3">4</span>
              <span>Purchase a phone number and go live</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
