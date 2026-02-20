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
      modification?: string;
      current_content?: string;
      new_content?: string;
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
  const [showDiff, setShowDiff] = useState(false);
  const [expandedIssueIdx, setExpandedIssueIdx] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Multi-select state for issues
  const [selectedIssueIdxs, setSelectedIssueIdxs] = useState<Set<number>>(new Set());
  const [generatingFix, setGeneratingFix] = useState(false);

  useEffect(() => {
    loadData();
  }, [agentId]);

  async function loadData() {
    try {
      setLoading(true);

      const [analysisRes, suggestionsRes] = await Promise.all([
        fetch(`/api/agents/${agentId}/ai-manager/analyze`),
        fetch(`/api/agents/${agentId}/ai-manager/suggestions`),
      ]);

      const analysisData = await analysisRes.json();
      const suggestionsData = await suggestionsRes.json();

      const analyses = analysisData.analyses || [];
      setLatestAnalysis(analyses.length > 0 ? analyses[0] : null);
      setSuggestions(suggestionsData.suggestions || []);
      setSelectedIssueIdxs(new Set());
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

  async function generateFixForSelectedIssues() {
    if (!latestAnalysis || selectedIssueIdxs.size === 0) return;

    const selectedIssues = Array.from(selectedIssueIdxs).map(idx => latestAnalysis.top_issues[idx]);

    const fixable = selectedIssues.filter(i => i.target_section !== 'none');
    if (fixable.length === 0) {
      setStatusMessage('All selected issues are platform-level. Adjust Retell speech settings instead.');
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }

    try {
      setGeneratingFix(true);
      setStatusMessage(`Generating fix for ${fixable.length} issue${fixable.length > 1 ? 's' : ''}... This takes 10-20 seconds.`);

      const res = await fetch(`/api/agents/${agentId}/ai-manager/generate-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issues: selectedIssues,
          analysisId: latestAnalysis.id,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(`Error: ${data.error || `HTTP ${res.status}`}`);
        setTimeout(() => setStatusMessage(null), 8000);
        return;
      }

      setStatusMessage(`Fix generated! Review the changes below.`);
      setSelectedIssueIdxs(new Set());
      setShowDiff(true);
      await loadData();
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`Error: ${errorMessage}`);
      console.error('Failed to generate fix:', error);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setGeneratingFix(false);
    }
  }

  function toggleIssueSelection(idx: number) {
    setSelectedIssueIdxs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  function selectAllIssues() {
    if (!latestAnalysis) return;
    const fixableIdxs = latestAnalysis.top_issues
      .map((issue, idx) => ({ issue, idx }))
      .filter(({ issue }) => issue.target_section !== 'none')
      .map(({ idx }) => idx);
    setSelectedIssueIdxs(new Set(fixableIdxs));
  }

  function deselectAllIssues() {
    setSelectedIssueIdxs(new Set());
  }

  async function handleAcceptSuggestion(suggestionId: string) {
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    try {
      setProcessingId(suggestionId);
      setStatusMessage('Applying fix and syncing to Retell...');

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
        setStatusMessage('Fix applied! Prompt updated and synced to Retell.');
        setShowDiff(false);
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
        setShowDiff(false);
        await loadData();
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    } finally {
      setProcessingId(null);
    }
  }

  // ─── Derived state ──────────────────────────────────────────────────────────

  const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');

  const fixableSelectedCount = latestAnalysis
    ? Array.from(selectedIssueIdxs)
        .map(idx => latestAnalysis.top_issues[idx])
        .filter(i => i?.target_section !== 'none').length
    : 0;

  // Find the pending suggestion linked to this analysis
  const pendingSuggestion = latestAnalysis?.suggestion_id
    ? suggestions.find(s => s.id === latestAnalysis.suggestion_id && s.status === 'pending') || null
    : null;

  const issuesAddressed = latestAnalysis?.suggestion_id
    ? suggestions.some(s => s.id === latestAnalysis.suggestion_id && s.status === 'accepted')
    : false;

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
            : statusMessage.includes('complete') || statusMessage.includes('accepted') || statusMessage.includes('generated') || statusMessage.includes('applied') || statusMessage.includes('Applied')
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Improvements</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-green-600">{acceptedSuggestions.length}</p>
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

            {/* Top Issues with Checkboxes */}
            {latestAnalysis.top_issues.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    Issues Found
                    {issuesAddressed && (
                      <span className="ml-2 text-sm font-medium text-green-600">— Fix Applied ✓</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3">
                    {!issuesAddressed && !pendingSuggestion && latestAnalysis.top_issues.length > 1 && (
                      <button
                        onClick={selectedIssueIdxs.size === fixableSelectedCount && fixableSelectedCount > 0 ? deselectAllIssues : selectAllIssues}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {selectedIssueIdxs.size > 0 ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                </div>

                {issuesAddressed && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      These issues have been addressed. Run a new analysis after more calls to see if the fixes are working.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {latestAnalysis.top_issues.map((issue, idx) => {
                    const isPlatformIssue = issue.target_section === 'none';
                    const isSelected = selectedIssueIdxs.has(idx);

                    return (
                      <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${
                        issuesAddressed
                          ? 'border-green-200 bg-green-50/30 opacity-75'
                          : isSelected
                            ? 'border-purple-400 bg-purple-50/30 shadow-sm'
                            : pendingSuggestion
                              ? 'border-blue-200 bg-blue-50/20'
                              : 'border-gray-200'
                      }`}>
                        <div className="flex items-center">
                          {/* Checkbox / Status indicator */}
                          <div className="pl-4 py-4 flex items-center">
                            {issuesAddressed ? (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : pendingSuggestion ? (
                              <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center" title="Fix ready for review">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                              </div>
                            ) : isPlatformIssue ? (
                              <div className="w-5 h-5 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center cursor-not-allowed" title="Platform-level issue — adjust in Retell settings">
                                <span className="text-xs text-gray-400">⚙</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleIssueSelection(idx)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300 hover:border-purple-400'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Issue content */}
                          <button
                            onClick={() => setExpandedIssueIdx(expandedIssueIdx === idx ? null : idx)}
                            className="flex-1 px-4 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
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
                              {isPlatformIssue && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                  PLATFORM
                                </span>
                              )}
                            </div>
                            <span className="text-gray-400 text-sm">
                              {expandedIssueIdx === idx ? '▼' : '▶'} {isPlatformIssue ? 'retell settings' : issue.target_section}
                            </span>
                          </button>
                        </div>

                        {expandedIssueIdx === idx && (
                          <div className="px-6 pb-4 border-t border-gray-100 ml-9">
                            <p className="text-gray-700 mt-3 mb-3">{issue.fix_guidance}</p>
                            {isPlatformIssue && (
                              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                                This is a platform-level issue. Adjust it in Retell&apos;s agent speech settings (Interruption Sensitivity, Responsiveness, etc.) — not the prompt.
                              </p>
                            )}
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
                    );
                  })}
                </div>

                {/* Generate Fix Button — only when issues are actionable */}
                {!issuesAddressed && !pendingSuggestion && (
                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={generateFixForSelectedIssues}
                      disabled={selectedIssueIdxs.size === 0 || generatingFix || fixableSelectedCount === 0}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingFix
                        ? 'Generating Fix...'
                        : fixableSelectedCount > 0
                          ? `Generate Fix (${fixableSelectedCount} issue${fixableSelectedCount > 1 ? 's' : ''})`
                          : 'Select Issues to Fix'
                      }
                    </button>
                    {selectedIssueIdxs.size > 0 && fixableSelectedCount === 0 && (
                      <p className="text-sm text-amber-600">Only platform-level issues selected</p>
                    )}
                  </div>
                )}

                {/* ─── Inline Diff + Accept/Reject (when fix is generated) ──── */}
                {pendingSuggestion && (
                  <div className="mt-6 border-2 border-purple-300 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 overflow-hidden">
                    <div className="px-6 py-4 bg-purple-100/60 border-b border-purple-200 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-gray-900">{pendingSuggestion.title}</h5>
                        <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{pendingSuggestion.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-4 ${
                        pendingSuggestion.impact_estimate === 'high' ? 'bg-red-100 text-red-700' :
                        pendingSuggestion.impact_estimate === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {pendingSuggestion.impact_estimate.toUpperCase()} IMPACT
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Diff toggle */}
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700 mb-3"
                      >
                        {showDiff ? '▼ Hide' : '▶ Show'} Changes ({pendingSuggestion.proposed_changes.changes.length} section{pendingSuggestion.proposed_changes.changes.length > 1 ? 's' : ''})
                      </button>

                      {showDiff && (
                        <div className="space-y-4 mb-4">
                          {pendingSuggestion.proposed_changes.changes.map((change, idx) => (
                            <div key={idx}>
                              <div className="text-xs font-bold text-purple-600 mb-2 uppercase">
                                {change.section}
                              </div>
                              {change.current_content && change.new_content ? (
                                <DiffView
                                  oldText={change.current_content}
                                  newText={change.new_content}
                                />
                              ) : change.modification ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <p className="text-xs text-green-600 font-medium mb-1">APPEND:</p>
                                  <p className="text-sm text-gray-700">{change.modification}</p>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Accept / Reject */}
                      <div className="flex gap-3 pt-4 border-t border-purple-200">
                        <button
                          onClick={() => handleAcceptSuggestion(pendingSuggestion.id)}
                          disabled={processingId === pendingSuggestion.id}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                          {processingId === pendingSuggestion.id ? 'Applying...' : 'Accept & Apply'}
                        </button>
                        <button
                          onClick={() => handleRejectSuggestion(pendingSuggestion.id)}
                          disabled={processingId === pendingSuggestion.id}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Improvements Applied */}
      {acceptedSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white">
              Improvements Applied ({acceptedSuggestions.length})
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-3">
              {acceptedSuggestions
                .slice(0, 10)
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-600">{s.description?.substring(0, 120)}</p>
                    </div>
                    <span className="text-sm text-gray-500 shrink-0 ml-4">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!latestAnalysis && acceptedSuggestions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🤖</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to AI Sales Manager</h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Click &ldquo;Run Analysis&rdquo; to analyze your recent calls. The AI will identify quality issues
            and you can select which ones to fix.
          </p>
          <p className="text-sm text-gray-500">
            Auto-triggers after every 10 completed calls.
          </p>
        </div>
      )}
    </div>
  );
}
