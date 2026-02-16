'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BarChart3,
  MessageSquare
} from 'lucide-react';

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

export default function AIManagerPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);

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
    if (!confirm('Accept this suggestion and create a new prompt version?')) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          action: 'accept',
          userId: 'user-id-placeholder' // TODO: Get from auth
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Suggestion accepted! New prompt version created.');
        loadData(); // Reload to show updated status
      } else {
        alert('Failed to accept suggestion: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      alert('Failed to accept suggestion');
    }
  }

  async function handleRejectSuggestion(suggestionId: string) {
    if (!confirm('Reject this suggestion?')) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/ai-manager/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          action: 'reject',
          userId: 'user-id-placeholder' // TODO: Get from auth
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Suggestion rejected');
        loadData(); // Reload to show updated status
      } else {
        alert('Failed to reject suggestion: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
      alert('Failed to reject suggestion');
    }
  }

  async function triggerPatternAnalysis() {
    if (!confirm('Analyze patterns from recent calls? This may take a few seconds.')) return;

    try {
      setAnalyzingPatterns(true);

      const res = await fetch(`/api/agents/${agentId}/ai-manager/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysSince: 7 })
      });

      const data = await res.json();

      if (data.success) {
        alert('Pattern analysis complete! Check for new suggestions.');
        loadData(); // Reload to show new suggestions
      } else {
        alert('Pattern analysis failed: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to run pattern analysis:', error);
      alert('Failed to run pattern analysis');
    } finally {
      setAnalyzingPatterns(false);
    }
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');

  const avgQuality = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + e.quality_score, 0) / evaluations.length
    : 0;

  const totalIssues = evaluations.reduce((sum, e) => sum + (e.issues_detected?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Manager data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Automatic call analysis and improvement suggestions
          </p>
        </div>
        <Button
          onClick={triggerPatternAnalysis}
          disabled={analyzingPatterns}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {analyzingPatterns ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingSuggestions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Calls Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{evaluations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total evaluations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(avgQuality * 100).toFixed(0)}%</div>
            <p className="text-xs text-gray-500 mt-1">Across all calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalIssues}</div>
            <p className="text-xs text-gray-500 mt-1">Total issues found</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggestions ({pendingSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Call Evaluations
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          {pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending suggestions</h3>
                <p className="text-gray-600 mb-4">
                  Run pattern analysis to generate improvement suggestions
                </p>
                <Button onClick={triggerPatternAnalysis} disabled={analyzingPatterns}>
                  Run Analysis Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            pendingSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        {suggestion.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={
                        suggestion.impact_estimate === 'high' ? 'destructive' :
                        suggestion.impact_estimate === 'medium' ? 'default' : 'secondary'
                      }>
                        {suggestion.impact_estimate} impact
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {(suggestion.confidence_score * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Source Calls */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Based on {suggestion.source_call_ids.length} calls
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {suggestion.source_call_ids.slice(0, 5).map((callId) => (
                        <Badge key={callId} variant="outline" className="font-mono text-xs">
                          {callId.substring(0, 8)}...
                        </Badge>
                      ))}
                      {suggestion.source_call_ids.length > 5 && (
                        <Badge variant="outline">
                          +{suggestion.source_call_ids.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Proposed Changes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Proposed Changes
                    </h4>
                    <div className="space-y-2">
                      {suggestion.proposed_changes.changes.map((change, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs font-medium text-purple-600 mb-1">
                            {change.section.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-700">
                            {change.modification}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept & Apply
                    </Button>
                    <Button
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4">
          {evaluations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations yet</h3>
                <p className="text-gray-600">
                  Call evaluations will appear here after calls are made
                </p>
              </CardContent>
            </Card>
          ) : (
            evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-mono">
                        Call: {evaluation.call_id.substring(0, 16)}...
                      </CardTitle>
                      <CardDescription>
                        {new Date(evaluation.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      evaluation.quality_score >= 0.8 ? 'default' :
                      evaluation.quality_score >= 0.6 ? 'secondary' : 'destructive'
                    }>
                      {(evaluation.quality_score * 100).toFixed(0)}% quality
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: 'Quality', value: evaluation.quality_score },
                      { label: 'Empathy', value: evaluation.empathy_score },
                      { label: 'Professional', value: evaluation.professionalism_score },
                      { label: 'Efficiency', value: evaluation.efficiency_score },
                      { label: 'Goal', value: evaluation.goal_achievement_score },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-2xl font-bold">
                          {(metric.value * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Issues */}
                  {evaluation.issues_detected && evaluation.issues_detected.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Issues Detected ({evaluation.issues_detected.length})
                      </h4>
                      <div className="space-y-2">
                        {evaluation.issues_detected.map((issue, idx) => (
                          <div key={idx} className="bg-orange-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-orange-700">
                                {issue.type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <Badge variant={
                                issue.severity === 'high' ? 'destructive' :
                                issue.severity === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
                                {issue.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-700">{issue.example}</div>
                            <div className="text-xs text-gray-500 mt-1">Turn {issue.turn}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {evaluation.summary_analysis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {evaluation.summary_analysis}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggestion History</CardTitle>
              <CardDescription>
                All suggestions including accepted and rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...acceptedSuggestions, ...rejectedSuggestions].map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={
                      suggestion.status === 'accepted' ? 'default' : 'secondary'
                    }>
                      {suggestion.status === 'accepted' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Accepted</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                      )}
                    </Badge>
                  </div>
                ))}
                {acceptedSuggestions.length === 0 && rejectedSuggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No suggestion history yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
