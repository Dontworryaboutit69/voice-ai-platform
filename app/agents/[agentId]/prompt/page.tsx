'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  business_name: string;
  status: string;
}

interface PromptVersion {
  id: string;
  version_number: number;
  compiled_prompt: string;
  token_count: number;
  generation_method: string;
  created_at: string;
}

export default function PromptPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState<PromptVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/agents/${agentId}/prompt`);
        const data = await response.json();

        if (data.success) {
          setAgent(data.agent);
          setPrompt(data.promptVersion);
        }
      } catch (error) {
        console.error('Error loading prompt:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!agent || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-red-600">Agent or prompt not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/" className="text-blue-600 hover:text-blue-700">← Back</a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{agent.business_name}</h1>
          <p className="text-gray-600 mt-1">
            Voice Agent Prompt - Version {prompt.version_number}
          </p>
        </div>

        {/* Metadata Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase">Status</div>
              <div className="font-medium text-gray-900 capitalize">{agent.status}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Token Count</div>
              <div className="font-medium text-gray-900">
                {prompt.token_count} words
                <span className="text-xs text-gray-500 ml-2">(~{Math.round(prompt.token_count * 1.3)} tokens)</span>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Generation Method</div>
              <div className="font-medium text-gray-900 capitalize">{prompt.generation_method.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Created</div>
              <div className="font-medium text-gray-900">
                {new Date(prompt.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Artifact */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
              {prompt.compiled_prompt}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="flex items-center justify-center h-12 px-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Test This Agent
          </button>
          <button className="flex items-center justify-center h-12 px-6 text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Edit Prompt
          </button>
          <button className="flex items-center justify-center h-12 px-6 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
