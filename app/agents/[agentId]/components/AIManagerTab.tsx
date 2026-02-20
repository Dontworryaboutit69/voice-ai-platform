'use client';

import { useEffect, useState } from 'react';
import { diffLines, Change } from 'diff';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BatchAnalysis {
  id: string;
  overall_quality_score: number;
  strengths: Array<{ label: string; detail: string }>;
  top_issues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    target_section: string;
    fix_guidance: string;
    evidence: string[];
  }>;
  calls_analyzed: number;
  calls_skipped: number;
  suggestion_id: string | null;
  created_at: string;
}

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
      modification?: string;    // Legacy
      current_content?: string;  // V2
      new_content?: string;      // V2
    }>;
  };
  created_at: string;
}

// ─── Diff View Component ─────────────────────────────────────────────────────

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const changes: Change[] = diffLines(oldText, newText);

  return (
    <div className="font-mono text-sm overflow-x-auto rounded-lg border border-gray-300 bg-gray-50">
      {changes.map((change, idx) => {
        const lines = change.value.split('\n').filter((l, i, arr) =>
          // Keep all lines except trailing empty
          i < arr.length - 1 || l.length > 0
        );

        return lines.map((line, lineIdx) => (
          <div
            key={`${idx}-${lineIdx}`}
            className={`px-4 py-0.5 border-b border-gray-200 last:border-b-0 ${
              change.added
                ? 'bg-green-100 text-green-900'
                : change.removed
                  ? 'bg-red-100 text-red-900 line-through'
                  : 'bg-white text-gray-700'
            }`}
          >
            <span className="inline-block w-6 text-gray-400 select-none mr-2">
              {change.added ? '+' : change.removed ? '-' : ' '}
            </span>
            {line || ' '}
          </div>
        ));
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIManagerTab({ agentId }: { agentId: string }) {
  const [latestAnalysis, setLatestAnalysis] = useState<BatchAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null);
  const [expandedIssueIdx, setExpandedIssueIdx] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [agentId]);

  async function loadData() {
    try {
      setLoading(true);

      // Load batch analyses
      const analysisRes = await fetch(`/api/agents/${agentId}/ai-manager/analyze`);
      const analysisData = await analysisRes.json();
      const analyses = analysisData.analyses || [];
      setLatestAnalysis(analyses.length > 0 ? analyses[0] : null);

      // Load suggestions
      const suggestionsRes = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`);
      const suggestionsData = await suggestionsRes.json();
      setSuggestions(suggestionsData.suggestions || []);
    } catch (error) {
      console.error('Failed to load AI Manager data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerAnalysis() {
    try {
      setAnalyzing(true);
      setStatusMessage('Running batch analysis... This takes 15-25 seconds.');

      const res = await fetch(`/api/agents/${agentId}/ai-manager/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callCount: 10, daysSince: 7 })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(`Error: ${data.error || `HTTP ${res.status}`}`);
        setTimeout(() => setStatusMessage(null), 8000);
        return;
      }

      const analysis = data.analysis;
      setStatusMessage(
        `Analysis complete! Quality: ${(analysis.overall_quality_score * 100).toFixed(0)}%, ` +
        `${analysis.calls_analyzed} calls analyzed, ` +
        `${analysis.top_issues.length} issues found.`
      );
      await loadData();
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`Error: ${errorMessage}`);
      console.error('Failed to run analysis:', error);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAcceptSuggestion(suggestionId: string) {
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    try {
      setProcessingId(suggestionId);
      setStatusMessage('Applying suggestion and syncing to Retell...');

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
        setStatusMessage('Suggestion accepted! Prompt updated and synced to Retell.');
        await loadData();
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage(`Failed: ${data.error || 'Unknown error'}`);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSuggestion(suggestionId: string) {
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    try {
      setProcessingId(suggestionId);

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
        await loadData();
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    } finally {
      setProcessingId(null);
    }
  }

  // ─── Derived state ──────────────────────────────────────────────────────────

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const acceptedCount = suggestions.filter(s => s.status === 'accepted').length;

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl font-semibold text-center ${
          statusMessage.startsWith('Error') || statusMessage.startsWith('Failed')
            ? 'bg-red-100 text-red-800'
            : statusMessage.includes('complete') || statusMessage.includes('accepted')
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
            AI Sales Manager
          </h2>
          <p className="text-lg text-gray-600">
            Batch call analysis with intelligent prompt improvements
          </p>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Quality</h3>
            <span className="text-3xl">
              {latestAnalysis
                ? latestAnalysis.overall_quality_score >= 0.8 ? '🟢' : latestAnalysis.overall_quality_score >= 0.6 ? '🟡' : '🔴'
                : '⚪'
              }
            </span>
          </div>
          <p className="text-3xl font-extrabold text-purple-600">
            {latestAnalysis ? `${(latestAnalysis.overall_quality_score * 100).toFixed(0)}%` : '—'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Latest Score</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Pending</h3>
            <span className="text-3xl">{pendingSuggestions.length > 0 ? '🔔' : '✓'}</span>
          </div>
          <p className="text-3xl font-extrabold text-blue-600">{pendingSuggestions.length}</p>
          <p className="text-sm text-gray-600 mt-1">Suggestions</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Accepted</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-green-600">{acceptedCount}</p>
          <p className="text-sm text-gray-600 mt-1">Applied</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Analyzed</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600">
            {latestAnalysis ? latestAnalysis.calls_analyzed : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Last Batch</p>
        </div>
      </div>

      {/* Latest Analysis Card */}
      {latestAnalysis && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white">Latest Analysis</h3>
            <p className="text-indigo-100 mt-1">
              {latestAnalysis.calls_analyzed} calls analyzed
              {latestAnalysis.calls_skipped > 0 && `, ${latestAnalysis.calls_skipped} skipped`}
              {' · '}
              {new Date(latestAnalysis.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          <div className="p-8">
            {/* Strengths */}
            {latestAnalysis.strengths.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {latestAnalysis.strengths.map((s, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                      <span className="font-semibold text-green-800">{s.label}</span>
                      {s.detail && (
                        <span className="text-green-600 ml-2 text-sm">— {s.detail}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Issues */}
            {latestAnalysis.top_issues.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Issues Found</h4>
                <div className="space-y-3">
                  {latestAnalysis.top_issues.map((issue, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedIssueIdx(expandedIssueIdx === idx ? null : idx)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-900">{issue.issue}</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {expandedIssueIdx === idx ? '▼' : '▶'} {issue.target_section}
                        </span>
                      </button>

                      {expandedIssueIdx === idx && (
                        <div className="px-6 pb-4 border-t border-gray-100">
                          <p className="text-gray-700 mt-3 mb-3">{issue.fix_guidance}</p>
                          {issue.evidence.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">Evidence:</p>
                              <ul className="space-y-1">
                                {issue.evidence.map((e, eIdx) => (
                                  <li key={eIdx} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                                    {e}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-lg font-semibold text-green-700">
                  No significant issues found! Agent is performing well.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Suggestions with Diff View */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">
            Pending Suggestions ({pendingSuggestions.length})
          </h3>
          <p className="text-purple-100 mt-1">Review and apply AI-generated prompt improvements</p>
        </div>

        <div className="p-8">
          {pendingSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✓</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No pending suggestions</h4>
              <p className="text-gray-600">
                {latestAnalysis
                  ? 'All suggestions have been reviewed. Run a new analysis to check for improvements.'
                  : 'Click "Run Analysis" to analyze recent calls and generate suggestions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                  {/* Header */}
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

                  {/* Diff View Toggle */}
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedSuggestionId(expandedSuggestionId === suggestion.id ? null : suggestion.id)}
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                    >
                      {expandedSuggestionId === suggestion.id ? '▼ Hide' : '▶ Show'} Changes ({suggestion.proposed_changes.changes.length})
                    </button>

                    {expandedSuggestionId === suggestion.id && (
                      <div className="space-y-4 mt-3">
                        {suggestion.proposed_changes.changes.map((change, idx) => (
                          <div key={idx}>
                            <div className="text-xs font-bold text-purple-600 mb-2 uppercase">
                              {change.section}
                            </div>

                            {/* V2: Diff view for new_content changes */}
                            {change.current_content && change.new_content ? (
                              <DiffView
                                oldText={change.current_content}
                                newText={change.new_content}
                              />
                            ) : change.modification ? (
                              /* Legacy: Show modification text */
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-xs text-green-600 font-medium mb-1">APPEND:</p>
                                <p className="text-sm text-gray-700">{change.modification}</p>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      disabled={processingId === suggestion.id}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {processingId === suggestion.id ? 'Applying...' : 'Accept & Apply'}
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                      disabled={processingId === suggestion.id}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Accepted */}
      {suggestions.filter(s => s.status === 'accepted').length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white">
              Recently Accepted ({suggestions.filter(s => s.status === 'accepted').length})
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-3">
              {suggestions
                .filter(s => s.status === 'accepted')
                .slice(0, 5)
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-600">{s.description?.substring(0, 100)}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!latestAnalysis && pendingSuggestions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🤖</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to AI Sales Manager</h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Click &ldquo;Run Analysis&rdquo; to analyze your recent calls. The AI will identify quality issues
            and suggest prompt improvements with before/after comparisons.
          </p>
          <p className="text-sm text-gray-500">
            Auto-triggers after every 10 completed calls.
          </p>
        </div>
      )}
    </div>
  );
}
