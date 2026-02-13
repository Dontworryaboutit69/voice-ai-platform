'use client';

interface WelcomeModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export default function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-500">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 px-10 py-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">👋</div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Your AI Agent Dashboard!</h2>
          <p className="text-blue-100 text-lg">Let's show you around so you can get started quickly</p>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
              <div className="text-3xl mb-3">🧪</div>
              <h3 className="font-bold text-gray-900 mb-2">Test Your Agent</h3>
              <p className="text-sm text-gray-600">Try out your AI with voice or text conversations</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-900 mb-2">Edit Prompts</h3>
              <p className="text-sm text-gray-600">Customize how your agent responds</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-gray-900 mb-2">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Add information your agent can reference</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-gray-900 mb-2">Deploy Live</h3>
              <p className="text-sm text-gray-600">Get a phone number and go live</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Quick Start Guide Available</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We'll walk you through each feature with interactive tooltips. The tour takes about 2 minutes
                  and you can skip or restart it anytime from the help menu.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={onSkip}
              className="flex-1 px-8 py-4 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Skip Tour
            </button>
            <button
              onClick={onStartTour}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              🎯 Start Interactive Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
