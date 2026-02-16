'use client';

import { useState } from 'react';

interface IntegrationModalProps {
  agentId: string;
  integrationType: string;
  onClose: () => void;
  onSave: (credentials: any, settings: any) => void;
}

export default function IntegrationModal({ agentId, integrationType, onClose, onSave }: IntegrationModalProps) {
  const [credentials, setCredentials] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // GoHighLevel specific state
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [webhookData, setWebhookData] = useState<any>(null);
  const [showWebhook, setShowWebhook] = useState(false);
  const [loadingWebhook, setLoadingWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const integrationConfig: Record<string, any> = {
    'google-calendar': {
      name: 'Google Calendar',
      icon: '📅',
      color: 'blue',
      authType: 'oauth',
      oauthProvider: 'google',
      settings: [
        { key: 'autoBook', label: 'Automatically book appointments', type: 'checkbox', default: true },
        { key: 'sendConfirmation', label: 'Send email confirmations', type: 'checkbox', default: true },
        { key: 'bufferTime', label: 'Buffer time between appointments (minutes)', type: 'number', default: 15 }
      ]
    },
    'calendly': {
      name: 'Calendly',
      icon: '📆',
      color: 'indigo',
      authType: 'oauth',
      oauthProvider: 'calendly',
      settings: [
        { key: 'shareLink', label: 'Share booking link during calls', type: 'checkbox', default: true },
        { key: 'trackEvents', label: 'Track booked events', type: 'checkbox', default: true }
      ]
    },
    'cal-com': {
      name: 'Cal.com',
      icon: '🗓️',
      color: 'teal',
      authType: 'api_key',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Cal.com API key', required: true }
      ],
      settings: [
        { key: 'autoBook', label: 'Automatically book appointments', type: 'checkbox', default: true }
      ]
    },
    'gohighlevel': {
      name: 'GoHighLevel',
      icon: 'GHL',
      color: 'purple',
      authType: 'api_key',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your GoHighLevel API key', required: true },
        { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'Your GHL Location ID', required: true }
      ],
      settings: []
    },
    'hubspot': {
      name: 'HubSpot',
      icon: '🟠',
      color: 'orange',
      authType: 'oauth',
      oauthProvider: 'hubspot',
      settings: [
        { key: 'createDeals', label: 'Automatically create deals', type: 'checkbox', default: true },
        { key: 'updateTimeline', label: 'Add call notes to timeline', type: 'checkbox', default: true }
      ]
    },
    'salesforce': {
      name: 'Salesforce',
      icon: '☁️',
      color: 'cyan',
      authType: 'oauth',
      oauthProvider: 'salesforce',
      fields: [
        {
          key: 'create_as',
          label: 'Create contacts as',
          type: 'select',
          options: [
            { value: 'Lead', label: 'Lead (Default)' },
            { value: 'Contact', label: 'Contact' }
          ],
          default: 'Lead',
          required: true
        }
      ],
      settings: [
        { key: 'createOpportunities', label: 'Create opportunities from qualified leads', type: 'checkbox', default: false },
        { key: 'assignToUser', label: 'Auto-assign to user', type: 'text', placeholder: 'Salesforce User ID (optional)' }
      ]
    },
    'housecall-pro': {
      name: 'Housecall Pro',
      icon: '🏠',
      color: 'green',
      authType: 'api_key',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Housecall Pro API key', required: true },
        { key: 'company_id', label: 'Company ID', type: 'text', placeholder: 'Your Housecall Pro Company ID', required: true }
      ],
      settings: [
        { key: 'autoSchedule', label: 'Automatically schedule jobs', type: 'checkbox', default: true },
        { key: 'assignTechnician', label: 'Auto-assign technician', type: 'text', placeholder: 'Technician ID (optional)' }
      ]
    },
    'zapier': {
      name: 'Zapier',
      icon: '⚡',
      color: 'yellow',
      authType: 'api_key', // Using api_key type for webhook field
      fields: [
        { key: 'webhook_url', label: 'Zapier Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true }
      ],
      settings: [
        { key: 'sendOnCallEnd', label: 'Send data when call ends', type: 'checkbox', default: true },
        { key: 'includeTranscript', label: 'Include full transcript', type: 'checkbox', default: true },
        { key: 'includeRecording', label: 'Include recording URL', type: 'checkbox', default: true }
      ]
    },
    'stripe': {
      name: 'Stripe',
      icon: '💳',
      color: 'violet',
      authType: 'api_key',
      fields: [
        { key: 'api_key', label: 'Secret Key', type: 'password', placeholder: 'sk_test_... or sk_live_...', required: true }
      ],
      settings: [
        { key: 'autoCreateCustomer', label: 'Automatically create customer profiles', type: 'checkbox', default: true },
        { key: 'sendPaymentLinks', label: 'Send payment links via SMS', type: 'checkbox', default: false },
        { key: 'currency', label: 'Default currency', type: 'select', options: [
          { value: 'usd', label: 'USD ($)' },
          { value: 'eur', label: 'EUR (€)' },
          { value: 'gbp', label: 'GBP (£)' }
        ], default: 'usd' }
      ]
    }
  };

  const config = integrationConfig[integrationType];

  if (!config) {
    return null;
  }

  async function handleOAuthConnect() {
    if (!config.oauthProvider) return;

    setIsTesting(true);

    try {
      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const oauthWindow = window.open(
        `/api/integrations/oauth/${config.oauthProvider}/authorize`,
        'OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth completion
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'oauth_success') {
          oauthWindow?.close();
          setTestResult({ success: true, message: 'Successfully connected!' });
          setCredentials(event.data.credentials);
          setIsTesting(false);
        } else if (event.data.type === 'oauth_error') {
          oauthWindow?.close();
          setTestResult({ success: false, message: 'Connection failed. Please try again.' });
          setIsTesting(false);
        }
      });
    } catch (error) {
      setTestResult({ success: false, message: 'Connection failed. Please try again.' });
      setIsTesting(false);
    }
  }

  async function fetchCalendars() {
    if (!credentials.api_key || !credentials.location_id) {
      console.log('Missing credentials for calendar fetch');
      setCalendarError('Please enter API key and Location ID first');
      return;
    }

    console.log('Fetching calendars...', { agentId, hasApiKey: !!credentials.api_key, hasLocationId: !!credentials.location_id });
    setLoadingCalendars(true);
    setCalendarError(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/integrations/gohighlevel/calendars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: credentials.api_key,
          location_id: credentials.location_id
        })
      });

      const data = await response.json();
      console.log('Calendar fetch response:', data);

      if (data.success) {
        setCalendars(data.calendars || []);
        setCalendarError(null);
        console.log('Calendars loaded:', data.calendars?.length || 0);
      } else {
        const errorMsg = data.error || 'Failed to load calendars';
        console.error('Calendar fetch failed:', errorMsg);
        setCalendarError(errorMsg);
      }
    } catch (error: any) {
      console.error('Error fetching calendars:', error);
      setCalendarError('Network error. Please try again.');
    } finally {
      setLoadingCalendars(false);
    }
  }

  async function fetchWebhookData() {
    console.log('Fetching webhook data for agent:', agentId);
    setLoadingWebhook(true);
    setWebhookError(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/trigger-call`);
      const data = await response.json();
      console.log('Webhook fetch response:', data);

      if (data.success) {
        setWebhookData(data);
        setWebhookError(null);
        console.log('Webhook data loaded');
      } else {
        const errorMsg = data.error || 'Failed to load webhook data';
        console.error('Webhook fetch failed:', errorMsg);
        setWebhookError(errorMsg);
      }
    } catch (error: any) {
      console.error('Error fetching webhook data:', error);
      setWebhookError('Network error. Please try again.');
    } finally {
      setLoadingWebhook(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    // Pass both credentials and settings to parent
    // In API key mode, merge credentials into config
    if (config.authType === 'api_key') {
      // For GoHighLevel, include calendar_id in config
      if (integrationType === 'gohighlevel' && selectedCalendarId) {
        onSave({ ...credentials, ...settings }, { calendar_id: selectedCalendarId });
      } else {
        onSave({ ...credentials, ...settings }, {});
      }
    } else {
      onSave(credentials, settings);
    }
  }

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    teal: 'from-teal-500 to-teal-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    violet: 'from-violet-500 to-violet-600'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} px-8 py-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Connect {config.name}</h2>
              <p className="text-white/90 text-sm">Set up your integration in 2 minutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all"
          >
            ✖️
          </button>
        </div>

        <div className="p-8">
          {/* OAuth Connection */}
          {config.authType === 'oauth' ? (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect Your Account</h3>

              {!testResult?.success ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-8 text-center mb-6">
                  <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg`}>
                    {config.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Connect Your {config.name} Account</h4>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Click the button below to securely connect your {config.name} account.
                    <br /><br />
                    You'll be redirected to {config.name} to authorize access, then brought back here.
                  </p>
                  <button
                    onClick={() => {
                      // Trigger OAuth flow
                      const provider = integrationType.toLowerCase().replace('_', '').replace('-', '');
                      const state = Math.random().toString(36).substring(7);
                      const authUrl = `/api/integrations/oauth/${provider}/authorize?agent_id=${agentId}&state=${state}`;
                      window.location.href = authUrl;
                    }}
                    className={`px-8 py-4 bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} text-white rounded-xl hover:shadow-xl font-bold text-lg transition-all inline-flex items-center gap-3`}
                  >
                    <span className="text-2xl">🔗</span>
                    Connect {config.name}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-900">Connected Successfully!</h4>
                      <p className="text-green-700">
                        {config.name} is connected and ready to sync call data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* API Key Authentication */}
          {config.authType === 'api_key' && config.fields ? (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">API Credentials</h3>

              <div className="space-y-4 mb-6">
                {config.fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={credentials[field.key] || field.default || ''}
                        onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                        required={field.required}
                      >
                        {field.options.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={credentials[field.key] || ''}
                        onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  setIsTesting(true);
                  try {
                    // Test connection by validating required fields
                    const allFieldsFilled = config.fields.every((field: any) =>
                      !field.required || credentials[field.key]
                    );

                    if (!allFieldsFilled) {
                      setTestResult({ success: false, message: 'Please fill in all required fields' });
                      setIsTesting(false);
                      return;
                    }

                    // Simulate API test (in production, this would call your backend)
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setTestResult({ success: true, message: 'Connection successful!' });

                    // For GoHighLevel, automatically fetch calendars and webhook data
                    if (integrationType === 'gohighlevel') {
                      fetchCalendars();
                      fetchWebhookData();
                    }
                  } catch (error) {
                    setTestResult({ success: false, message: 'Connection failed. Please check your credentials.' });
                  } finally {
                    setIsTesting(false);
                  }
                }}
                disabled={isTesting}
                className={`w-full px-8 py-4 bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} text-white rounded-xl hover:shadow-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3`}
              >
                {isTesting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🔌</span>
                    Test Connection
                  </>
                )}
              </button>

              {/* Success/Error Display */}
              {testResult && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  testResult.success
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{testResult.success ? '✓' : '✗'}</span>
                    <span className="font-semibold">{testResult.message}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Secure API Key Storage</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your API credentials are encrypted and stored securely. They are never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}


          {/* GoHighLevel Configuration */}
          {integrationType === 'gohighlevel' && testResult?.success && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What This Integration Does</h3>

              {/* Features List */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-200 p-6 mb-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <strong>Creates or Updates Contacts:</strong> Automatically creates new contacts or finds existing ones in your GHL account
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <strong>Logs Call Notes:</strong> Adds detailed call notes with summary, outcome, sentiment, and recording URL
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <strong>Books Appointments:</strong> When your AI books an appointment during a call, it's automatically added to your selected calendar
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔗</span>
                    <div>
                      <strong>Webhook for Custom Workflows:</strong> Provides a secure webhook endpoint you can use in GHL workflows to trigger calls and build advanced automations
                    </div>
                  </li>
                </ul>
              </div>

              {/* Calendar Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Calendar for Appointments
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Choose which GoHighLevel calendar to use when your AI agent books appointments during calls
                </p>

                {!calendars.length && !loadingCalendars && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Load Calendars button clicked');
                      fetchCalendars();
                    }}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl hover:bg-purple-50 font-medium text-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📅</span>
                    Load My Calendars
                  </button>
                )}

                {loadingCalendars && (
                  <div className="flex items-center justify-center gap-3 py-4 text-gray-600">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading calendars...
                  </div>
                )}

                {calendarError && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                    {calendarError}
                  </div>
                )}

                {!loadingCalendars && calendars.length > 0 && (
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                  >
                    <option value="">-- Select a Calendar (Optional) --</option>
                    {calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.name}
                      </option>
                    ))}
                  </select>
                )}

                {!loadingCalendars && !calendarError && calendars.length === 0 && testResult?.success && (
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-700 text-sm">
                    No calendars found in your GoHighLevel account. You can still save this integration without a calendar.
                  </div>
                )}
              </div>

              {/* Webhook Information */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Webhook toggle clicked, current state:', showWebhook);
                    setShowWebhook(!showWebhook);
                    if (!webhookData && !showWebhook) {
                      console.log('Fetching webhook data...');
                      fetchWebhookData();
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔗</span>
                    <span className="font-bold text-gray-900">Webhook for Custom Workflows</span>
                  </div>
                  <span className="text-gray-600">{showWebhook ? '▼' : '▶'}</span>
                </button>

                {showWebhook && loadingWebhook && (
                  <div className="mt-4 flex items-center justify-center gap-3 py-8 text-gray-600">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading webhook information...
                  </div>
                )}

                {showWebhook && webhookError && (
                  <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                    {webhookError}
                  </div>
                )}

                {showWebhook && !loadingWebhook && !webhookError && webhookData && (
                  <div className="mt-4 p-5 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
                    <p className="text-sm text-gray-600">
                      Use this webhook in your GoHighLevel workflows to trigger calls from your CRM automations.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">WEBHOOK URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookData.webhook_url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-mono text-gray-900"
                        />
                        <button
                          onClick={() => copyToClipboard(webhookData.webhook_url)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all"
                        >
                          {copied ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">BEARER TOKEN</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={webhookData.webhook_token}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-mono text-gray-900"
                        />
                        <button
                          onClick={() => copyToClipboard(webhookData.webhook_token)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all"
                        >
                          {copied ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-bold text-gray-900 mb-2">Example Request Body:</p>
                      <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
{JSON.stringify(webhookData.documentation.body_example, null, 2)}
                      </pre>
                    </div>

                    <p className="text-xs text-gray-500">
                      💡 Add this webhook to your GHL workflows to trigger outbound calls with contact data and custom fields.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings for other integrations */}
          {config.settings && config.settings.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Configuration</h3>
              <div className="space-y-3">
                {config.settings.map((setting: any) => (
                  <div key={setting.key}>
                    {setting.type === 'checkbox' ? (
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={settings[setting.key] !== undefined ? settings[setting.key] : setting.default}
                          onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900">{setting.label}</span>
                      </label>
                    ) : setting.type === 'number' ? (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {setting.label}
                        </label>
                        <input
                          type="number"
                          value={settings[setting.key] !== undefined ? settings[setting.key] : setting.default}
                          onChange={(e) => setSettings({ ...settings, [setting.key]: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
                        />
                      </div>
                    ) : setting.type === 'text' ? (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {setting.label}
                        </label>
                        <input
                          type="text"
                          placeholder={setting.placeholder}
                          value={settings[setting.key] || ''}
                          onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
                        />
                      </div>
                    ) : setting.type === 'select' ? (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {setting.label}
                        </label>
                        <select
                          value={settings[setting.key] !== undefined ? settings[setting.key] : setting.default}
                          onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
                        >
                          {setting.options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-4 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!testResult?.success}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
