'use client';

import { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

interface Message {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
}

const VOICE_OPTIONS = [
  { id: '11labs-Adrian', name: 'Adrian', description: 'Male, Confident (Default)' },
  { id: '11labs-Sarah', name: 'Sarah', description: 'Female, Professional' },
  { id: 'openai-Alloy', name: 'Alloy', description: 'Neutral, Clear' },
  { id: 'openai-Shimmer', name: 'Shimmer', description: 'Female, Warm' }
];

const MODEL_OPTIONS = [
  // GPT 5.2
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Default' },
  { id: 'gpt-5.2-fast', name: 'GPT-5.2', description: 'Fast Tier' },

  // GPT 5.1
  { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Default' },
  { id: 'gpt-5.1-fast', name: 'GPT-5.1', description: 'Fast Tier' },

  // GPT 5
  { id: 'gpt-5', name: 'GPT-5', description: 'Default' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Fastest' },

  // GPT 4.1
  { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Default' },
  { id: 'gpt-4.1-fast', name: 'GPT-4.1', description: 'Fast' }
];

export default function RetellVoiceTest({ agentId }: { agentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testMode, setTestMode] = useState<'text' | 'voice'>('voice');
  const [trainingMode, setTrainingMode] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('11labs-Adrian');
  const [selectedModel, setSelectedModel] = useState('gpt-5.2');
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const retellClient = useRef<RetellWebClient | null>(null);
  const callStartTime = useRef<number | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Retell client
    retellClient.current = new RetellWebClient();

    // Set up event listeners
    retellClient.current.on('call_started', () => {
      console.log('Call started');
      setIsCallActive(true);
      setIsConnecting(false);
      callStartTime.current = Date.now();
      addMessage('system', '📞 Call connected! Start speaking naturally.');

      // Start duration counter
      durationInterval.current = setInterval(() => {
        if (callStartTime.current) {
          setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
        }
      }, 1000);
    });

    retellClient.current.on('call_ended', async () => {
      console.log('Call ended');
      setIsCallActive(false);
      setIsConnecting(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      const duration = callDuration > 0 ? ` (${formatDuration(callDuration)})` : '';
      addMessage('system', `📴 Call ended${duration}`);

      // Auto-sync call from Retell (workaround for webhook not firing)
      addMessage('system', '🔄 Syncing call to database...');
      try {
        const response = await fetch(`/api/webhooks/retell/sync-calls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId })
        });
        const data = await response.json();
        if (data.success) {
          addMessage('system', `✅ Call saved! Check the Call History tab to see this conversation.`);
        } else {
          console.error('Sync failed:', data.error);
        }
      } catch (error) {
        console.error('Error syncing call:', error);
      }
    });

    retellClient.current.on('agent_start_talking', () => {
      console.log('Agent started talking');
    });

    retellClient.current.on('agent_stop_talking', () => {
      console.log('Agent stopped talking');
    });

    retellClient.current.on('audio', (audio: Uint8Array) => {
      // Audio is automatically played by the SDK
    });

    retellClient.current.on('update', (update: any) => {
      // Handle transcript updates
      if (update.transcript && update.transcript.length > 0) {
        setMessages(prev => {
          const newMessages: Message[] = [];
          const processedIds = new Set<string>();

          // Process all transcripts and update/add messages
          update.transcript.forEach((transcript: any, index: number) => {
            const role = transcript.role === 'agent' ? 'agent' : 'user';
            // Strip SSML tags from the text
            const text = transcript.content.replace(/<[^>]*>/g, '');
            const msgId = `${role}-${index}`;

            if (!processedIds.has(msgId)) {
              processedIds.add(msgId);
              newMessages.push({ role, text, timestamp: new Date() });
            }
          });

          // Only update if there are actual changes
          if (newMessages.length === 0) return prev;

          // Replace all voice-related messages with the new transcript
          const systemMessages = prev.filter(msg => msg.role === 'system');
          return [...systemMessages, ...newMessages];
        });
      }
    });

    retellClient.current.on('error', (error: any) => {
      console.error('Retell error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      let errorMsg = 'Connection failed';
      if (error.message) {
        errorMsg = error.message;
      }
      if (error.code === 8 || errorMsg.includes('timeout')) {
        errorMsg = 'Connection timeout - this usually means:\n• Retell service is temporarily unavailable\n• Your network is blocking WebRTC\n• Microphone permissions denied\n\nTry refreshing the page and clicking "Allow" when prompted for microphone access.';
      }

      addMessage('system', '❌ Error: ' + errorMsg);
      setIsCallActive(false);
      setIsConnecting(false);
    });

    return () => {
      if (retellClient.current) {
        retellClient.current.stopCall();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  async function startVoiceCall() {
    setIsConnecting(true);

    // Check microphone permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      addMessage('system', '🎤 Microphone ready');
    } catch (micError: any) {
      console.error('Microphone permission error:', micError);
      addMessage('system', '❌ Microphone access denied. Please allow microphone access in your browser settings and try again.');
      setIsConnecting(false);
      return;
    }

    // Add timeout to prevent infinite connecting state
    const timeout = setTimeout(() => {
      setIsConnecting(false);
      addMessage('system', '❌ Connection timeout. Retell service may be temporarily unavailable. Try again in a moment.');
    }, 15000); // 15 second timeout

    try {
      console.log('Creating Retell web call...');

      // Create web call with Retell
      const response = await fetch(`/api/agents/${agentId}/test/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: selectedVoice, modelId: selectedModel })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Retell response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create call');
      }

      if (!data.accessToken) {
        throw new Error('No access token received from server');
      }

      // Start call with access token
      if (retellClient.current) {
        console.log('Starting call with Retell SDK...');
        await retellClient.current.startCall({
          accessToken: data.accessToken,
          sampleRate: 24000, // Retell requires 24kHz
          emitRawAudioSamples: false
        });
        clearTimeout(timeout); // Clear timeout on success
      } else {
        throw new Error('Retell client not initialized');
      }
    } catch (error: any) {
      console.error('Error starting call:', error);
      clearTimeout(timeout);
      addMessage('system', '❌ Failed to start call: ' + error.message);
      setIsConnecting(false);
    }
  }

  async function stopVoiceCall() {
    if (retellClient.current) {
      retellClient.current.stopCall();
    }
    setIsCallActive(false);
    setIsConnecting(false);
    setCallDuration(0);

    // If in training mode and there's feedback text, auto-submit it
    if (trainingMode && feedbackInput.trim()) {
      await submitFeedback();
    }
  }

  async function sendTextMessage() {
    if (!textInput.trim()) return;

    const userMessage = textInput.trim();
    setTextInput('');
    addMessage('user', userMessage);

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter(m => m.role === 'user' || m.role === 'agent')
        .map(m => ({
          role: m.role,
          content: m.text
        }));

      const response = await fetch(`/api/agents/${agentId}/test/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        addMessage('agent', data.response);
      } else {
        addMessage('system', `❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', '❌ Failed to get response');
    }
  }

  async function submitFeedback() {
    if (!feedbackInput.trim() || isProcessingFeedback) return;

    const feedback = feedbackInput.trim();
    setFeedbackInput('');
    setIsProcessingFeedback(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();

      if (data.success) {
        addMessage('system', `✅ Success! Prompt updated to version ${data.versionNumber}`);
        addMessage('system', '💡 Your AI has been trained and leveled up!');

        // Clear conversation after successful training - ready for fresh test
        setTimeout(() => {
          clearConversation();
        }, 2000); // Give user 2 seconds to see success message
      } else {
        addMessage('system', `❌ Failed to apply feedback: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addMessage('system', '❌ Failed to apply feedback - please try again');
    } finally {
      setIsProcessingFeedback(false);
    }
  }

  function addMessage(role: 'user' | 'agent' | 'system', text: string) {
    setMessages(prev => [...prev, { role, text, timestamp: new Date() }]);
  }

  function clearConversation() {
    setMessages([]);
    setCallDuration(0);
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Training Overlay - Blocks all interaction while processing */}
      {isProcessingFeedback && (
        <div className="absolute inset-0 z-50 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-8 px-8">
            {/* Animated Spinner */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-8 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-t-purple-400 border-r-pink-400 border-b-blue-400 border-l-indigo-400 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-8 border-purple-300/20 rounded-full"></div>
              <div className="absolute inset-4 border-8 border-t-pink-300 border-r-purple-300 border-b-indigo-300 border-l-blue-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
            </div>

            {/* Training Messages */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white animate-pulse">
                Training Your AI Employee
              </h2>
              <p className="text-xl text-purple-200 font-medium">
                ✨ Leveling up your AI with advanced learning
              </p>
              <p className="text-lg text-indigo-300">
                Analyzing feedback and optimizing prompt intelligence...
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-left text-purple-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Processing natural language feedback</span>
              </div>
              <div className="flex items-center gap-3 text-left text-purple-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Generating optimized prompt variations</span>
              </div>
              <div className="flex items-center gap-3 text-left text-purple-200">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span>Validating improvements and quality</span>
              </div>
              <div className="flex items-center gap-3 text-left text-purple-200">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <span>Deploying enhanced AI capabilities</span>
              </div>
            </div>

            {/* Fun Stats */}
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-sm text-purple-200">
                <strong className="text-white">💡 Did you know?</strong> Your AI learns from every piece of feedback,
                becoming more aligned with your business needs over time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Test Mode Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTestMode('voice')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  testMode === 'voice'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                🎤 Voice
              </button>
              <button
                onClick={() => setTestMode('text')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  testMode === 'text'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                💬 Text
              </button>
            </div>

            {/* Voice & Model Selection (Voice mode only) */}
            {testMode === 'voice' && (
              <>
                <div className="h-8 w-px bg-blue-200"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">Voice:</span>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isCallActive || isConnecting}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {VOICE_OPTIONS.map(voice => (
                      <option key={voice.id} value={voice.id} className="text-gray-900">
                        {voice.name} - {voice.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-8 w-px bg-blue-200"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">Model:</span>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isCallActive || isConnecting}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {MODEL_OPTIONS.map(model => (
                      <option key={model.id} value={model.id} className="text-gray-900">
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Training Mode Toggle */}
            <div className="h-8 w-px bg-blue-200"></div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(e) => setTrainingMode(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                🎯 Training Mode
              </span>
            </label>
          </div>

          <button
            onClick={clearConversation}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-white/50 rounded-lg transition-all"
          >
            Clear Chat
          </button>
        </div>

        {/* Call Duration (Voice mode only) */}
        {testMode === 'voice' && isCallActive && (
          <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-white rounded-xl border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-green-700">
              Call Active: {formatDuration(callDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Layout when Training Mode is Active */}
      {trainingMode ? (
        <div className="flex-1 flex gap-6 p-6 bg-gray-50 min-h-0">
          {/* Left: Conversation */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>💬</span> Live Conversation
              </h3>
              <p className="text-sm text-gray-600 mt-1">Watch and listen as your AI agent responds</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                  <div className="text-6xl mb-4">
                    {testMode === 'voice' ? '🎤' : '💬'}
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    {testMode === 'voice' ? 'Start a Voice Call' : 'Start Typing'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testMode === 'voice'
                      ? 'Click "Start Call" below to begin'
                      : 'Type a message to test your agent'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' :
                        msg.role === 'system' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20'
                            : msg.role === 'system'
                            ? 'bg-yellow-100 text-yellow-900 text-sm italic border-2 border-yellow-200'
                            : 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm'
                        }`}
                      >
                        {msg.role === 'agent' && (
                          <div className="text-xs text-gray-500 mb-1 font-semibold">🤖 AI Agent</div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <div className="text-xs opacity-70 mt-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input at bottom of conversation */}
            <div className="flex-shrink-0 bg-white border-t-2 border-gray-200 p-6">
              {testMode === 'text' ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <button
                    onClick={sendTextMessage}
                    disabled={!textInput.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  {!isCallActive && !isConnecting ? (
                    <button
                      onClick={startVoiceCall}
                      className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-xl shadow-green-600/30 transition-all hover:scale-105"
                    >
                      📞 Start Call
                    </button>
                  ) : isConnecting ? (
                    <div className="px-10 py-5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Connecting...
                    </div>
                  ) : (
                    <button
                      onClick={stopVoiceCall}
                      className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 font-bold text-lg shadow-xl shadow-red-600/30 transition-all animate-pulse"
                    >
                      📴 End Call
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Training Notes */}
          <div className="w-[500px] flex flex-col bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-300 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-4 border-b-2 border-yellow-300">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🎯</span> Training Notes
              </h3>
              <p className="text-sm text-gray-700 mt-1">Write what needs to improve</p>
            </div>

            <div className="flex-1 p-6 flex flex-col min-h-0">
              <div className="mb-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-sm font-bold text-yellow-900 mb-2">💡 How to Use Training Mode:</p>
                <ul className="text-xs text-yellow-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Test your agent on the left (voice or text)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Take notes here about what needs fixing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Click "🚀 Train AI" to apply improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Test again to verify the changes worked</span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-sm font-bold text-gray-900 mb-2">Your Training Feedback:</label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Example notes:&#10;&#10;• Greeting is too long - make it 2 sentences max&#10;• Add more empathy when handling objections&#10;• Ask about budget earlier in conversation&#10;• Use simpler language, avoid jargon&#10;• Be more enthusiastic and energetic"
                  className="flex-1 px-4 py-3 border-2 border-yellow-300 bg-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-medium text-sm resize-none min-h-0"
                  disabled={isProcessingFeedback}
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={!feedbackInput.trim() || isProcessingFeedback}
                className="mt-4 w-full px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 font-bold text-lg shadow-lg shadow-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                {isProcessingFeedback ? '⏳ Training AI...' : '🚀 Train AI Now'}
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                Tip: Be specific! "Make greeting shorter" is better than "improve greeting"
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Layout when Training Mode is OFF */
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <div className="text-6xl mb-4">
                  {testMode === 'voice' ? '🎤' : '💬'}
                </div>
                <p className="text-xl font-semibold mb-2">
                  {testMode === 'voice' ? 'Start a Voice Call' : 'Start Typing'}
                </p>
                <p className="text-sm text-gray-600">
                  {testMode === 'voice'
                    ? 'Click "Start Call" below to begin a natural conversation with your AI agent'
                    : 'Type a message to test your agent in text mode'
                  }
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' :
                      msg.role === 'system' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20'
                          : msg.role === 'system'
                          ? 'bg-yellow-100 text-yellow-900 text-sm italic border-2 border-yellow-200'
                          : 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className="text-xs text-gray-500 mb-1 font-semibold">🤖 AI Agent</div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex-shrink-0 bg-white border-t-2 border-gray-200 p-6 space-y-4">
            {testMode === 'text' ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                {!isCallActive && !isConnecting ? (
                  <button
                    onClick={startVoiceCall}
                    className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-xl shadow-green-600/30 transition-all hover:scale-105"
                  >
                    📞 Start Call
                  </button>
                ) : isConnecting ? (
                  <div className="px-10 py-5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  <button
                    onClick={stopVoiceCall}
                    className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 font-bold text-lg shadow-xl shadow-red-600/30 transition-all animate-pulse"
                  >
                    📴 End Call
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
