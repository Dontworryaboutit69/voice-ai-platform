'use client';

import { useState, useEffect } from 'react';

interface WebhookInfoProps {
  agentId: string;
}

export default function WebhookInfo({ agentId }: WebhookInfoProps) {
  const [webhookData, setWebhookData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhookInfo();
  }, [agentId]);

  async function fetchWebhookInfo() {
    try {
      const response = await fetch(`/api/agents/${agentId}/trigger-call`);
      const data = await response.json();

      if (data.success) {
        setWebhookData(data);
      }
    } catch (error) {
      console.error('Error fetching webhook info:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!webhookData) {
    return null;
  }

  const curlExample = `curl -X POST "${webhookData.webhook_url}" \\
  -H "Authorization: Bearer ${webhookData.webhook_token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to_number": "+15551234567",
    "contact_name": "John Doe",
    "contact_data": {
      "email": "john@example.com",
      "service": "roofing"
    }
  }'`;

  const ghlWorkflowInstructions = `1. In GoHighLevel, create a new Workflow
2. Add a "Webhook" action
3. Set Method: POST
4. Set URL: ${webhookData.webhook_url}
5. Add Header: Authorization = Bearer ${webhookData.webhook_token}
6. Set Body (JSON):
{
  "to_number": "{{contact.phone}}",
  "contact_name": "{{contact.fullName}}",
  "contact_data": {
    "email": "{{contact.email}}"
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🔗</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Webhook Integration</h3>
          <p className="text-sm text-gray-600">Trigger calls from your CRM workflows</p>
        </div>
      </div>

      {/* Webhook URL */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-gray-700 mb-2">Webhook URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookData.webhook_url}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-mono text-gray-700"
          />
          <button
            onClick={() => copyToClipboard(webhookData.webhook_url, 'url')}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
          >
            {copied === 'url' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Webhook Token */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-gray-700 mb-2">Authorization Token</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={webhookData.webhook_token}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-mono text-gray-700"
          />
          <button
            onClick={() => copyToClipboard(webhookData.webhook_token, 'token')}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
          >
            {copied === 'token' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          🔒 Keep this token secret. It authorizes calls to this agent.
        </p>
      </div>

      {/* Usage Examples */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📚</span>
          Usage Examples
        </h4>

        {/* GoHighLevel Example */}
        <div className="mb-6">
          <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">→</span>
            GoHighLevel Workflow
          </h5>
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
{ghlWorkflowInstructions}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(ghlWorkflowInstructions, 'ghl')}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {copied === 'ghl' ? '✓ Copied!' : '📋 Copy Instructions'}
          </button>
        </div>

        {/* cURL Example */}
        <div>
          <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">→</span>
            cURL Example
          </h5>
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
{curlExample}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(curlExample, 'curl')}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {copied === 'curl' ? '✓ Copied!' : '📋 Copy Command'}
          </button>
        </div>
      </div>

      {/* Request Body Schema */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
        <h4 className="font-bold text-gray-900 mb-3">Request Body Schema</h4>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <code className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-mono text-xs">to_number</code>
            <span className="text-red-600 font-bold">*</span>
            <span className="text-gray-600">Phone number in E.164 format (e.g., +15551234567)</span>
          </div>
          <div className="flex gap-3">
            <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono text-xs">contact_name</code>
            <span className="text-gray-400">optional</span>
            <span className="text-gray-600">Name of the person being called</span>
          </div>
          <div className="flex gap-3">
            <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono text-xs">contact_data</code>
            <span className="text-gray-400">optional</span>
            <span className="text-gray-600">Additional contact information (email, address, etc.)</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">How It Works</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Create workflows in your CRM (GoHighLevel, Zapier, Make, etc.)</li>
              <li>When a trigger fires (new lead, status change, etc.), call this webhook</li>
              <li>The agent will automatically call the contact</li>
              <li>All call data syncs back to your CRM via the integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
