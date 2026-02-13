'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  features: string[];
  useCases: string[];
  integrations?: string[];
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: 'homevanna-re',
    name: 'Homevanna AI',
    description: 'Smart real estate AI agent for property valuations, market analysis, and client engagement',
    category: 'Real Estate',
    icon: '🏡',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    popular: true,
    features: [
      'Instant property valuations using RentCast AVM',
      'Market trend analysis and insights',
      'Automated lead qualification',
      'Property comparison and recommendations',
      'Mortgage calculator integration',
      'Neighborhood insights and demographics'
    ],
    useCases: [
      'Real estate agents qualifying leads',
      'Property management companies',
      'Real estate investment firms',
      'Home buyers seeking valuations'
    ],
    integrations: ['RentCast API', 'Google Maps', 'MLS Data']
  }
  // More templates coming soon...
];

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function createFromTemplate(templateId: string) {
    try {
      const response = await fetch('/api/marketplace/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/agents/${data.agentId}`);
      } else {
        alert('Failed to create agent: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent from template');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Agent Marketplace
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Launch your AI agent in minutes with pre-built templates
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none shadow-lg"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-3 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {category === 'all' ? '🌟 All Templates' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="group relative bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              {/* Popular Badge */}
              {template.popular && (
                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-lg animate-pulse">
                  ⭐ POPULAR
                </div>
              )}

              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative">
                {/* Icon & Title */}
                <div className="mb-6">
                  <div className="text-7xl mb-4">{template.icon}</div>
                  <h3 className={`text-3xl font-black bg-gradient-to-r ${template.gradient} bg-clip-text text-transparent mb-2`}>
                    {template.name}
                  </h3>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {template.category}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    ✨ Key Features
                  </h4>
                  <ul className="space-y-2">
                    {template.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Integrations */}
                {template.integrations && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      🔌 Integrations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.integrations.map((integration, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200"
                        >
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => createFromTemplate(template.id)}
                  className={`w-full px-8 py-4 bg-gradient-to-r ${template.gradient} text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3`}
                >
                  <span>🚀</span>
                  Create Agent
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No templates found</h3>
            <p className="text-xl text-gray-600 mb-8">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
