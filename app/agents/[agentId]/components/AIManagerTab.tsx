'use client';

import { useEffect, useState } from 'react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  confidence_score: number;
  impact_estimate: 'low' | 'medium' | 'high';
  source_call_ids: string[];
  proposed_changes: {
    sections: string[];
    changes: Array<{
      section: string;
      modification: string;
    }>;
  };
  created_at: string;
}

interface Evaluation {
  id: string;
  call_id: string;
  quality_score: number;
  empathy_score: number;
  professionalism_score: number;
  efficiency_score: number;
  goal_achievement_score: number;
  issues_detected: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    turn: number;
    example: string;
  }>;
  opportunities: Array<{
    type: string;
    description: string;
  }>;
  summary_analysis: string;
  created_at: string;
}

export default function AIManagerTab({ agentId }: { agentId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [agentId]);

  async function loadData() {
    try {
      setLoading(true);

      // Load suggestions
      const suggestionsRes = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`);
      const suggestionsData = await suggestionsRes.json();
      setSuggestions(suggestionsData.suggestions || []);

      // Load evaluations
      const evaluationsRes = await fetch(`/api/agents/${agentId}/ai-manager/evaluations`);
      const evaluationsData = await evaluationsRes.json();
      setEvaluations(evaluationsData.evaluations || []);
    } catch (error) {
      console.error('Failed to load AI Manager data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptSuggestion(suggestionId: string) {
    // Use system user ID since we don't have auth yet
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    try {
      setProcessingId(suggestionId);
      setStatusMessage('Applying suggestion and creating new prompt version...');

      const res = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          action: 'accept',
          userId: SYSTEM_USER_ID
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage('✅ Suggestion accepted! New prompt version created.');
        // Success - reload data to show updated state
        await loadData();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage(`❌ Failed: ${data.error || 'Unknown error'}`);
        console.error('Failed to accept suggestion:', data.error);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (error) {
      setStatusMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to accept suggestion:', error);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSuggestion(suggestionId: string) {
    // Use system user ID since we don't have auth yet
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    try {
      setLoading(true);

      const res = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          action: 'reject',
          userId: SYSTEM_USER_ID
        })
      });

      const data = await res.json();

      if (data.success) {
        // Success - reload data
        await loadData();
      } else {
        console.error('Failed to reject suggestion:', data.error);
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerPatternAnalysis() {
    try {
      setAnalyzingPatterns(true);
      setStatusMessage('Running pattern analysis... This may take 30-60 seconds.');

      // Create a timeout promise (2 minutes)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timed out after 2 minutes')), 120000);
      });

      // Race between fetch and timeout
      const fetchPromise = fetch(`/api/agents/${agentId}/ai-manager/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysSince: 7 })
      });

      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      const data = await res.json();

      if (data.success) {
        const parts = [`Evaluated ${data.evaluated || 0} calls`];
        if (data.skipped) parts.push(`skipped ${data.skipped} non-interactive`);
        if (data.patternError) parts.push(`Note: ${data.patternError}`);

        setStatusMessage(`✅ Analysis complete! ${parts.join(', ')}.`);
        await loadData();
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage(`❌ ${data.error || 'Analysis failed. Check server logs.'}`);
        console.error('Analysis failed:', data.error);
        setTimeout(() => setStatusMessage(null), 8000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`❌ Error: ${errorMessage}`);
      console.error('Failed to run pattern analysis:', error);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setAnalyzingPatterns(false);
    }
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');

  const avgQuality = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + e.quality_score, 0) / evaluations.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Manager data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl font-semibold text-center ${
          statusMessage.startsWith('✅') ? 'bg-green-100 text-green-800' :
          statusMessage.startsWith('❌') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
            🤖 AI Manager
          </h2>
          <p className="text-lg text-gray-600">Automatic call analysis and improvement suggestions</p>
        </div>
        <button
          onClick={triggerPatternAnalysis}
          disabled={analyzingPatterns}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {analyzingPatterns ? '⏳ Analyzing...' : '🔄 Run Analysis'}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Pending</h3>
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-3xl font-extrabold text-purple-600">{pendingSuggestions.length}</p>
          <p className="text-sm text-gray-600 mt-1">Suggestions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Analyzed</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-extrabold text-blue-600">{evaluations.length}</p>
          <p className="text-sm text-gray-600 mt-1">Calls</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Quality</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <p className="text-3xl font-extrabold text-green-600">{(avgQuality * 100).toFixed(0)}%</p>
          <p className="text-sm text-gray-600 mt-1">Avg Score</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Accepted</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600">{acceptedSuggestions.length}</p>
          <p className="text-sm text-gray-600 mt-1">Applied</p>
        </div>
      </div>

      {/* Pending Suggestions */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>📝</span> Pending Suggestions ({pendingSuggestions.length})
            </h3>
            <p className="text-purple-100 mt-1">AI-generated improvements based on call analysis</p>
          </div>
          <button
            onClick={triggerPatternAnalysis}
            disabled={analyzingPatterns}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {analyzingPatterns ? '⏳ Analyzing...' : '🔄 Run Analysis'}
          </button>
        </div>

        <div className="p-8">
          {pendingSuggestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🤖</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No pending suggestions</h4>
              <p className="text-gray-600 mb-6">
                Click "Run Analysis" to analyze recent calls and generate suggestions
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{suggestion.title}</h4>
                      <p className="text-gray-700">{suggestion.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        suggestion.impact_estimate === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.impact_estimate === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.impact_estimate.toUpperCase()} IMPACT
                      </span>
                      <span className="text-sm text-gray-600">
                        {(suggestion.confidence_score * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Based on {Array.isArray(suggestion.source_call_ids) ? suggestion.source_call_ids.length : 0} calls
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(suggestion.source_call_ids) && suggestion.source_call_ids.slice(0, 5).map((callId, idx) => (
                        <span key={callId || idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700">
                          {typeof callId === 'string' ? callId.substring(0, 8) + '...' : 'invalid'}
                        </span>
                      ))}
                      {Array.isArray(suggestion.source_call_ids) && suggestion.source_call_ids.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          +{suggestion.source_call_ids.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proposed Changes */}
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedSuggestionId(expandedSuggestionId === suggestion.id ? null : suggestion.id)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 mb-2"
                    >
                      {expandedSuggestionId === suggestion.id ? '▼ Hide' : '▶ Show'} Proposed Changes ({suggestion.proposed_changes.changes.length})
                    </button>
                    
                    {expandedSuggestionId === suggestion.id && (
                      <div className="space-y-2 mt-2">
                        {suggestion.proposed_changes.changes.map((change, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="text-xs font-bold text-purple-600 mb-2">
                              {change.section.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-700">
                              {change.modification}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                    >
                      ✅ Accept & Apply
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>📊</span> Recent Call Evaluations
          </h3>
          <p className="text-blue-100 mt-1">Quality scores from analyzed calls</p>
        </div>

        <div className="p-8">
          {evaluations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No evaluations yet. Calls will be analyzed automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.slice(0, 5).map((evaluation) => (
                <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-sm text-gray-600">
                      Call: {evaluation.call_id.substring(0, 16)}...
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      evaluation.quality_score >= 0.8 ? 'bg-green-100 text-green-700' :
                      evaluation.quality_score >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(evaluation.quality_score * 100).toFixed(0)}% Quality
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      { label: 'Quality', value: evaluation.quality_score },
                      { label: 'Empathy', value: evaluation.empathy_score },
                      { label: 'Professional', value: evaluation.professionalism_score },
                      { label: 'Efficiency', value: evaluation.efficiency_score },
                      { label: 'Goal', value: evaluation.goal_achievement_score },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {(metric.value * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {evaluation.issues_detected && evaluation.issues_detected.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        ⚠️ {evaluation.issues_detected.length} issue(s) detected
                      </p>
                      {evaluation.issues_detected.slice(0, 2).map((issue, idx) => (
                        <div key={idx} className="text-xs text-gray-600 ml-4">
                          • {issue.type.replace(/_/g, ' ')} (turn {issue.turn})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
