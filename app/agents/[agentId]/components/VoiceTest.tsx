'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
}

export default function VoiceTest({ agentId }: { agentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testMode, setTestMode] = useState<'text' | 'voice'>('text');
  const [trainingMode, setTrainingMode] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      addMessage('system', 'Recording... Click again to stop');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }

  function stopVoiceRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function processVoiceInput(audioBlob: Blob) {
    setIsProcessing(true);

    try {
      // TODO: Send audio to speech-to-text service
      // For now, simulate with placeholder
      const userText = "[Voice input transcribed]";
      addMessage('user', userText);

      // Get agent response
      await getAgentResponse(userText);
    } catch (error) {
      console.error('Error processing voice:', error);
      addMessage('system', 'Error processing voice input');
    } finally {
      setIsProcessing(false);
    }
  }

  async function sendTextMessage() {
    if (!textInput.trim()) return;

    const userMessage = textInput.trim();
    setTextInput('');
    addMessage('user', userMessage);

    await getAgentResponse(userMessage);
  }

  async function getAgentResponse(userMessage: string) {
    setIsProcessing(true);

    try {
      // TODO: Implement actual agent conversation
      // For now, simulate response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = "Hi! Thanks for calling. How can I help you today?";
      addMessage('agent', response);

      // If in voice mode, speak the response
      if (testMode === 'voice') {
        speakText(response);
      }
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  function speakText(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  async function submitFeedback() {
    if (!feedbackInput.trim()) return;

    const feedback = feedbackInput.trim();
    setFeedbackInput('');

    addMessage('system', `Applying feedback: "${feedback}"`);

    try {
      const response = await fetch(`/api/agents/${agentId}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();

      if (data.success) {
        addMessage('system', `✅ Prompt updated! Now using version ${data.versionNumber}`);
      } else {
        addMessage('system', `❌ Failed to apply feedback: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addMessage('system', '❌ Failed to apply feedback');
    }
  }

  function addMessage(role: 'user' | 'agent' | 'system', text: string) {
    setMessages(prev => [...prev, { role, text, timestamp: new Date() }]);
  }

  function clearConversation() {
    setMessages([]);
    addMessage('system', 'Conversation cleared. Start testing again!');
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mode Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Test Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTestMode('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  testMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💬 Text
              </button>
              <button
                onClick={() => setTestMode('voice')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  testMode === 'voice'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎤 Voice
              </button>
            </div>

            {/* Training Mode Toggle */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trainingMode}
                  onChange={(e) => setTrainingMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  🎯 Training Mode
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={clearConversation}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Clear Chat
          </button>
        </div>

        {/* Training Mode Notice */}
        {trainingMode && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Training Mode Active:</strong> After testing, provide feedback below to improve the prompt automatically.
            </p>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">
              {testMode === 'voice' ? '🎤 Click the microphone to start' : '💬 Start typing to test'}
            </p>
            <p className="text-sm">
              {testMode === 'voice'
                ? 'Speak naturally like you would on a real call'
                : 'Type as if you\'re calling the business'
              }
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' :
                msg.role === 'system' ? 'justify-center' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.role === 'system'
                    ? 'bg-yellow-100 text-yellow-900 text-sm italic'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {msg.role === 'agent' && (
                  <div className="text-xs text-gray-500 mb-1">🤖 Agent</div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-3">
        {/* Main Input */}
        {testMode === 'text' ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendTextMessage}
              disabled={!textInput.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎤 Start Speaking'}
            </button>
          </div>
        )}

        {/* Training Mode Feedback */}
        {trainingMode && (
          <div className="flex gap-3 pt-3 border-t border-gray-200">
            <input
              type="text"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitFeedback()}
              placeholder="Tell the AI what to improve (e.g., 'Make the greeting shorter')"
              className="flex-1 px-4 py-2 border border-yellow-300 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              onClick={submitFeedback}
              disabled={!feedbackInput.trim()}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Improve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
