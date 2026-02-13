'use client';

import { useState } from 'react';

interface IntegrationModalProps {
  integrationType: string;
  onClose: () => void;
  onSave: (credentials: any, settings: any) => void;
}

export default function IntegrationModal({ integrationType, onClose, onSave }: IntegrationModalProps) {
  const [credentials, setCredentials] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const integrationConfig: Record<string, any> = {
    'google-calendar': {
      name: 'Google Calendar',
      icon: 'G',
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
      icon: 'C',
      color: 'indigo',
      authType: 'oauth',
      oauthProvider: 'calendly',
      settings: [
        { key: 'shareLink', label: 'Share booking link during calls', type: 'checkbox', default: true },
        { key: 'trackEvents', label: 'Track booked events', type: 'checkbox', default: true }
      ]
    },
    'gohighlevel': {
      name: 'GoHighLevel',
      icon: 'GHL',
      color: 'purple',
      authType: 'oauth',
      oauthProvider: 'gohighlevel',
      settings: [
        { key: 'createContacts', label: 'Create contacts from calls', type: 'checkbox', default: true },
        { key: 'logCalls', label: 'Log call recordings', type: 'checkbox', default: true },
        { key: 'createOpportunities', label: 'Create opportunities automatically', type: 'checkbox', default: false },
        { key: 'triggerWorkflows', label: 'Trigger workflows on specific events', type: 'checkbox', default: false }
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

  function handleSave() {
    onSave(credentials, settings);
  }

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-blue-400 to-indigo-500',
    purple: 'from-purple-500 to-purple-600'
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
                <>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-8 text-center mb-6">
                    <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg`}>
                      {config.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Sign in to {config.name}</h4>
                    <p className="text-gray-600 mb-6">
                      Click the button below to securely connect your {config.name} account. <br />
                      We'll redirect you to {config.name} to authorize access.
                    </p>
                    <button
                      onClick={handleOAuthConnect}
                      disabled={isTesting}
                      className={`px-8 py-4 bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} text-white rounded-xl hover:shadow-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3`}
                    >
                      {isTesting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">🔐</span>
                          Connect {config.name}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Secure OAuth Connection</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          We use OAuth 2.0 for secure authentication. Your {config.name} password is never shared with us.
                          You can revoke access anytime from your {config.name} settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-900">Successfully Connected!</h4>
                      <p className="text-green-700">Your {config.name} account is now connected.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {testResult && !testResult.success && (
                <div className="mt-4 p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✗</span>
                    <span className="font-semibold">{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Integration Settings</h3>
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
                  ) : null}
                </div>
              ))}
            </div>
          </div>


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
