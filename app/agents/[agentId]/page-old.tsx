'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VoiceTest from './components/VoiceTest';

interface Agent {
  id: string;
  name: string;
  business_name: string;
  business_type: string;
  status: string;
}

interface PromptVersion {
  id: string;
  version_number: number;
  compiled_prompt: string;
  token_count: number;
  prompt_knowledge: string;
}

type Tab = 'prompt' | 'knowledge' | 'test' | 'settings';

export default function AgentDashboard() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState<PromptVersion | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('prompt');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');

  useEffect(() => {
    loadData();
  }, [agentId]);

  async function loadData() {
    try {
      const response = await fetch(`/api/agents/${agentId}/prompt`);
      const data = await response.json();

      if (data.success) {
        setAgent(data.agent);
        setPrompt(data.promptVersion);
        setEditedPrompt(data.promptVersion.compiled_prompt);
      }
    } catch (error) {
      console.error('Error loading agent:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!agent || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                ← Back
              </a>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{agent.business_name}</h1>
                <p className="text-sm text-gray-500 capitalize">{agent.business_type} • Version {prompt.version_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full capitalize">
                {agent.status}
              </span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Deploy Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'prompt'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📝 Prompt
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'knowledge'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📚 Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'test'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🧪 Test Agent
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚙️ Settings
            </button>
          </nav>

          {/* Agent Stats */}
          <div className="p-4 mt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 uppercase font-medium mb-3">Agent Stats</div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Token Count</div>
                <div className="text-sm font-medium text-gray-900">{prompt.token_count} words</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Calls Handled</div>
                <div className="text-sm font-medium text-gray-900">0</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Success Rate</div>
                <div className="text-sm font-medium text-gray-900">-</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 overflow-auto">
          {/* Prompt Tab */}
          {activeTab === 'prompt' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Agent Prompt</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                  >
                    {isEditing ? 'Cancel' : 'Edit Prompt'}
                  </button>
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-4 flex gap-3">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditedPrompt(prompt.compiled_prompt);
                          setIsEditing(false);
                        }}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                      {prompt.compiled_prompt}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600 mb-4">
                    Add knowledge base items that your agent can reference during conversations.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    + Add Knowledge Base Item
                  </button>

                  {/* Show existing KB if available */}
                  {prompt.prompt_knowledge && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                        {prompt.prompt_knowledge}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Agent Tab */}
          {activeTab === 'test' && (
            <div className="h-full">
              <VoiceTest agentId={agentId} />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        defaultValue={agent.business_name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voice Model
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>11labs-Sarah</option>
                        <option>11labs-Michael</option>
                        <option>11labs-Emma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        defaultValue={agent.status}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                      >
                        <option value="draft">Draft</option>
                        <option value="testing">Testing</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>

                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
