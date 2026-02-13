'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    description: '',
    website: '',
    location: '',
    callObjective: '',
    personalityTone: 'friendly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Call the API to generate prompt
      const response = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the agent prompt page
        router.push(`/agents/${data.agentId}/prompt`);
      } else {
        alert('Failed to generate prompt: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Voice AI Agent</h1>
          <p className="mt-2 text-gray-600">
            Tell us about your business and we'll generate a production-ready voice agent prompt
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Acme Roofing"
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type *
            </label>
            <select
              id="businessType"
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select a type...</option>
              <option value="restaurant">Restaurant</option>
              <option value="roofing">Roofing</option>
              <option value="dental">Dental</option>
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="legal">Legal Services</option>
              <option value="real-estate">Real Estate</option>
              <option value="home-services">Home Services</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Brief Description of Services *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="We provide residential and commercial roofing services including repairs, replacements, and inspections..."
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website (optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="https://acmeroofing.com"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Service Area *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="San Francisco, CA"
            />
          </div>

          {/* Call Objective */}
          <div>
            <label htmlFor="callObjective" className="block text-sm font-medium text-gray-700 mb-2">
              What should the agent do when someone calls? *
            </label>
            <textarea
              id="callObjective"
              name="callObjective"
              required
              rows={3}
              value={formData.callObjective}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Qualify leads, collect their contact info and problem details, and schedule a free inspection..."
            />
          </div>

          {/* Personality */}
          <div>
            <label htmlFor="personalityTone" className="block text-sm font-medium text-gray-700 mb-2">
              Personality Tone
            </label>
            <select
              id="personalityTone"
              name="personalityTone"
              value={formData.personalityTone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="friendly">Friendly & Casual</option>
              <option value="professional">Professional</option>
              <option value="empathetic">Warm & Empathetic</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center h-14 px-8 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Prompt with Claude...
                </>
              ) : (
                'Generate My Voice Agent'
              )}
            </button>
            <p className="mt-3 text-sm text-gray-500 text-center">
              This will take 10-15 seconds as Claude analyzes your business and creates a custom prompt
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
