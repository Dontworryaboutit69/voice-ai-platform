export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Above the fold */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          {/* Trust Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-700">Trusted by 60+ businesses • From agency experts</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build Pro Voice AI Agents
              </span>
              <br />
              <span className="text-gray-900">In Minutes, Not Months</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              We deployed 60+ voice AI agents at $5k–$20k each. Now you can create yours <strong className="text-gray-900">for free</strong>—no coding, no complexity.
            </p>

            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Fill out a form. AI builds your agent. Test it free. Go live with one click.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/agents"
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Building Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="width" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </a>

              <a
                href="/marketplace"
                className="px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl shadow-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                <span>🏪</span>
                Browse Templates
              </a>
            </div>

            {/* Quick Value Props */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No coding required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Test 100% free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Live in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Stop Losing Customers to Voicemail
            </h2>
            <p className="text-xl text-gray-300">
              Every missed call is lost revenue. Traditional solutions are broken.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-5xl mb-4">😤</div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">DIY Custom Builds</h3>
              <p className="text-gray-300">
                Months of development, $10k–$50k costs, constant debugging. Who has time for that?
              </p>
            </div>

            <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">Basic AI Services</h3>
              <p className="text-gray-300">
                Limited features, robotic voices, no customization. Pay $49+/month for mediocre results.
              </p>
            </div>

            <div className="p-8 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">Expensive Agencies</h3>
              <p className="text-gray-300">
                $5k–$20k per agent, slow turnaround, ongoing maintenance costs. Not scalable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-sm mb-4">
              THE BETTER WAY
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-gray-900">
              Agency-Grade AI Agents, Zero Complexity
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're the agency that built 60+ voice AI systems for clients. Now our entire platform is yours—same quality, none of the cost or hassle.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-gray-200">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black mb-6 text-gray-900">Built by Experts, Made for Everyone</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-lg text-gray-900">Claude Sonnet 4.5 Powered:</strong>
                      <p className="text-gray-600">Best-in-class AI generates production-ready prompts from your business details</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-lg text-gray-900">Self-Improving System:</strong>
                      <p className="text-gray-600">Give feedback during testing and watch your agent get better automatically</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-lg text-gray-900">Premium Voice Cloning:</strong>
                      <p className="text-gray-600">Upload audio, clone any voice, or choose from 100+ realistic voices</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-4xl font-black mb-2">$0</div>
                  <div className="text-xl mb-6">to start building</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Unlimited testing
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Full voice library
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      AI improvements
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No credit card
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-4xl shadow-xl animate-bounce">
                  ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-gray-900">
              From Zero to Live in 4 Steps
            </h2>
            <p className="text-xl text-gray-600">
              No technical knowledge required. Seriously.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-200 relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="text-5xl mb-4 text-center">📝</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">Fill Simple Form</h3>
                <p className="text-gray-600 text-center">
                  Business name, services, personality—takes 2 minutes. AI does the rest.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-200 relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="text-5xl mb-4 text-center">🤖</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">AI Builds Agent</h3>
                <p className="text-gray-600 text-center">
                  Claude Sonnet 4.5 generates production-ready prompts in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-pink-200 relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="text-5xl mb-4 text-center">🎙️</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">Test for Free</h3>
                <p className="text-gray-600 text-center">
                  Chat or call your agent. Give feedback. Watch it improve automatically.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-200 relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  4
                </div>
                <div className="text-5xl mb-4 text-center">📞</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">Go Live</h3>
                <p className="text-gray-600 text-center">
                  Buy phone number, activate agent, track every call with full analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="/agents"
              className="inline-block px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300"
            >
              Start Step 1 Now →
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-gray-900">
              Why Choose Us Over Alternatives?
            </h2>
            <p className="text-xl text-gray-600">
              We're not just cheaper—we're better.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-5 text-left text-lg font-bold">Feature</th>
                  <th className="px-6 py-5 text-center text-lg font-bold">Us 🚀</th>
                  <th className="px-6 py-5 text-center text-lg font-bold">Hey Rosie</th>
                  <th className="px-6 py-5 text-center text-lg font-bold">Custom Build</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Time to Live</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">5 minutes</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">1-2 hours</td>
                  <td className="px-6 py-5 text-center text-gray-600">2-6 months</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Starting Cost</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">$0 (Free)</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">$49/month</td>
                  <td className="px-6 py-5 text-center text-gray-600">$10k-$50k</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Customization</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">Fully Custom</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">Limited</td>
                  <td className="px-6 py-5 text-center text-gray-600">Full (if you code)</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Voice Cloning</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">✓ Included</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">✗ No</td>
                  <td className="px-6 py-5 text-center text-gray-600">✓ Extra cost</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Self-Improving AI</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">✓ Yes</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">✗ No</td>
                  <td className="px-6 py-5 text-center text-gray-600">✗ Manual only</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Full Analytics</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">✓ Built-in</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">✓ Basic</td>
                  <td className="px-6 py-5 text-center text-gray-600">Build yourself</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-5 font-semibold text-gray-900">Technical Skills Needed</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">Zero</span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600">None</td>
                  <td className="px-6 py-5 text-center text-gray-600">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Built by the Team That Did This 60+ Times
            </h2>
            <p className="text-2xl mb-8 text-purple-200">
              We were the agency charging $5k–$20k per voice AI agent. Now you get the same platform, same expertise, same results—starting at $0.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-5xl font-black text-purple-300 mb-2">60+</div>
                <div className="text-lg">Agents Deployed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-5xl font-black text-purple-300 mb-2">$750k+</div>
                <div className="text-lg">Revenue Generated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-5xl font-black text-purple-300 mb-2">100%</div>
                <div className="text-lg">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900">
            Stop Losing Calls. Start Now.
          </h2>
          <p className="text-2xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Every minute you wait, your competitors are answering calls you're missing.
          </p>
          <p className="text-xl text-gray-500 mb-10">
            Build your agent in 5 minutes. Test it free. No credit card needed.
          </p>

          <a
            href="/agents"
            className="inline-block px-16 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-2xl font-black rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300"
          >
            Create Your Agent Free →
          </a>

          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2026 Voice AI Platform. Built by the team that deployed 60+ enterprise voice AI agents.
          </p>
          <p className="text-xs mt-2">
            Powered by Claude Sonnet 4.5 • Retell AI • ElevenLabs
          </p>
        </div>
      </footer>
    </div>
  );
}
