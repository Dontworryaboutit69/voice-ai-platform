export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="flex flex-col items-center gap-8 px-8 py-16 max-w-4xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Voice AI Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Create production-ready voice AI agents in minutes. No coding required.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <a
            href="/onboarding"
            className="flex items-center justify-center h-14 px-8 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Create Your First Agent
          </a>
          <p className="text-sm text-gray-500 text-center">
            Fill out a simple form • AI generates your prompt • Test via voice or text • Go live with a phone number
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl">🎯</div>
            <h3 className="font-semibold text-gray-900">AI-Powered Generation</h3>
            <p className="text-sm text-gray-600">
              Claude Sonnet 4.5 creates production-ready prompts from your business details
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl">🔄</div>
            <h3 className="font-semibold text-gray-900">Self-Improving</h3>
            <p className="text-sm text-gray-600">
              Give feedback during testing and watch your agent get better automatically
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-3xl">📞</div>
            <h3 className="font-semibold text-gray-900">Production Ready</h3>
            <p className="text-sm text-gray-600">
              Purchase a phone number and go live. Track calls, transcripts, and analytics
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 max-w-2xl">
          <p className="text-sm text-gray-600 text-center">
            <strong className="text-gray-900">Database Status:</strong> ✅ Connected to Supabase<br/>
            <strong className="text-gray-900">Framework:</strong> ✅ Ready for your Claude instructions<br/>
            <strong className="text-gray-900">Dev Server:</strong> ✅ Running on http://localhost:3000
          </p>
        </div>
      </main>
    </div>
  );
}
