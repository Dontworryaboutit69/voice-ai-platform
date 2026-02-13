'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const loadingMessages = [
  "Formulating your prompt...",
  "Agent in progress...",
  "Teaching your agent to be conversational...",
  "Adding natural language patterns...",
  "Crafting the perfect personality...",
  "Almost there...",
  "Aww, a new agent is born! 🎉"
];

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Cycle through messages every 4 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4000);

    // Animate dots
    const dotInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Poll for completion
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/prompt`);
        const data = await response.json();

        if (data.success) {
          // Agent is ready! Redirect to dashboard
          clearInterval(messageInterval);
          clearInterval(dotInterval);
          clearInterval(pollInterval);

          // Show final message briefly
          setMessageIndex(loadingMessages.length - 1);

          setTimeout(() => {
            router.push(`/agents/${agentId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotInterval);
      clearInterval(pollInterval);
    };
  }, [agentId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-32 h-32 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>

            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {loadingMessages[messageIndex]}{dots}
          </h2>
          <p className="text-gray-600">
            This usually takes 30-60 seconds
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 space-y-2">
          {loadingMessages.slice(0, messageIndex + 1).map((msg, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
