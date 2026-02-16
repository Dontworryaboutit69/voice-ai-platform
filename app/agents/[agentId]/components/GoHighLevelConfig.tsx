'use client';

import { useState, useEffect } from 'react';

interface Pipeline {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface GoHighLevelConfigProps {
  agentId: string;
  apiKey: string;
  locationId: string;
  initialConfig?: any;
  onConfigChange: (config: any) => void;
}

const CALL_OUTCOMES = [
  { value: 'appointment_booked', label: 'Appointment Booked', description: 'Customer scheduled an appointment', icon: '📅' },
  { value: 'callback_requested', label: 'Callback Requested', description: 'Customer asked to be called back', icon: '📞' },
  { value: 'message_taken', label: 'Message Taken', description: 'Customer left contact info', icon: '📝' },
  { value: 'qualified_lead', label: 'Qualified Lead', description: 'Customer expressed interest', icon: '⭐' },
  { value: 'not_interested', label: 'Not Interested', description: 'Customer declined service', icon: '❌' },
  { value: 'unhappy_customer', label: 'Unhappy Customer', description: 'Customer expressed dissatisfaction', icon: '😔' },
];

export default function GoHighLevelConfig({
  agentId,
  apiKey,
  locationId,
  initialConfig = {},
  onConfigChange
}: GoHighLevelConfigProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const [selectedPipelineId, setSelectedPipelineId] = useState(initialConfig.pipeline_id || '');
  const [selectedStageId, setSelectedStageId] = useState(initialConfig.stage_id || '');
  const [workflowMappings, setWorkflowMappings] = useState(initialConfig.workflow_mappings || {});

  const [addToPipeline, setAddToPipeline] = useState(initialConfig.addToPipeline !== false);
  const [triggerWorkflows, setTriggerWorkflows] = useState(initialConfig.triggerWorkflows === true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pipelines only when addToPipeline is enabled
  useEffect(() => {
    if (apiKey && locationId && addToPipeline) {
      fetchPipelines();
    }
  }, [apiKey, locationId, addToPipeline]);

  // Fetch workflows only when triggerWorkflows is enabled
  useEffect(() => {
    if (apiKey && locationId && triggerWorkflows) {
      fetchWorkflows();
    }
  }, [apiKey, locationId, triggerWorkflows]);

  // Fetch stages when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      fetchStages(selectedPipelineId);
    } else {
      setStages([]);
      setSelectedStageId('');
    }
  }, [selectedPipelineId]);

  // Notify parent of config changes
  useEffect(() => {
    const config: any = {
      addToPipeline,
      triggerWorkflows
    };

    // Only include pipeline config if addToPipeline is enabled
    if (addToPipeline) {
      config.pipeline_id = selectedPipelineId;
      config.stage_id = selectedStageId;
    }

    // Only include workflow mappings if triggerWorkflows is enabled
    if (triggerWorkflows) {
      config.workflow_mappings = workflowMappings;
    }

    onConfigChange(config);
  }, [selectedPipelineId, selectedStageId, workflowMappings, addToPipeline, triggerWorkflows]);

  async function fetchPipelines() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/integrations/gohighlevel/pipelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, location_id: locationId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pipelines');
      }

      setPipelines(data.pipelines || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching pipelines:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStages(pipelineId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/integrations/gohighlevel/pipelines/${pipelineId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, location_id: locationId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stages');
      }

      setStages(data.stages || []);
    } catch (err: any) {
      console.error('Error fetching stages:', err);
      setStages([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkflows() {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/integrations/gohighlevel/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, location_id: locationId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch workflows');
      }

      setWorkflows(data.workflows || []);
    } catch (err: any) {
      console.error('Error fetching workflows:', err);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Pipeline Configuration */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="addToPipeline"
            checked={addToPipeline}
            onChange={(e) => setAddToPipeline(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="addToPipeline" className="text-lg font-bold text-gray-900 cursor-pointer">
            Add Contacts to Pipeline
          </label>
        </div>

        {addToPipeline && (
          <div className="ml-8 space-y-4 border-l-4 border-purple-200 pl-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Pipeline <span className="text-red-500">*</span>
              </label>
              {loading && pipelines.length === 0 ? (
                <div className="text-sm text-gray-500">Loading pipelines...</div>
              ) : (
                <select
                  value={selectedPipelineId}
                  onChange={(e) => setSelectedPipelineId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                >
                  <option value="">-- Select a Pipeline --</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              )}
              {pipelines.length === 0 && !loading && (
                <p className="mt-2 text-sm text-gray-500">
                  No pipelines found. Create pipelines in GoHighLevel first.
                </p>
              )}
            </div>

            {selectedPipelineId && stages.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Stage (Optional)
                </label>
                <select
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                >
                  <option value="">-- No specific stage --</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Leave blank to add to pipeline without a specific stage
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workflow Triggers */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="triggerWorkflows"
            checked={triggerWorkflows}
            onChange={(e) => setTriggerWorkflows(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="triggerWorkflows" className="text-lg font-bold text-gray-900 cursor-pointer">
            Trigger Workflows by Call Outcome
          </label>
        </div>

        {triggerWorkflows && (
          <div className="ml-8 space-y-4 border-l-4 border-purple-200 pl-6">
            <p className="text-sm text-gray-600 mb-4">
              Map different call outcomes to specific workflows. The appropriate workflow will trigger automatically based on what happened in the call.
            </p>

            {workflows.length === 0 ? (
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-600 text-sm">
                No workflows found. Create workflows in GoHighLevel to use this feature.
              </div>
            ) : (
              <div className="space-y-3">
                {CALL_OUTCOMES.map((outcome) => (
                  <div key={outcome.value} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{outcome.icon}</span>
                      <div className="flex-1">
                        <label className="block font-bold text-gray-900 mb-1">
                          {outcome.label}
                        </label>
                        <p className="text-xs text-gray-600 mb-3">{outcome.description}</p>
                        <select
                          value={workflowMappings[outcome.value] || ''}
                          onChange={(e) => setWorkflowMappings({
                            ...workflowMappings,
                            [outcome.value]: e.target.value
                          })}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm text-gray-900 bg-white"
                        >
                          <option value="">-- No workflow --</option>
                          {workflows.map((workflow) => (
                            <option key={workflow.id} value={workflow.id}>
                              {workflow.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">How It Works</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>After each call ends, the contact is created in GoHighLevel</li>
              <li>If pipeline is selected, contact is added to that pipeline/stage</li>
              <li>If workflows are mapped, the appropriate workflow triggers based on call outcome</li>
              <li>All actions are logged and can be reviewed in the integration sync logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
