'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, X, Save } from 'lucide-react';
import { createBrowserClient as createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface DataField {
  id: string;
  type: 'text' | 'phone' | 'email' | 'select';
  label: string;
  required: boolean;
  enabled: boolean;
  isCustom?: boolean;
  options?: string[]; // For select type
}

interface DataCollectionConfigProps {
  agentId: string;
}

// Pre-defined standard fields
const STANDARD_FIELDS: DataField[] = [
  { id: 'name', type: 'text', label: 'Customer Name', required: false, enabled: false },
  { id: 'phone', type: 'phone', label: 'Phone Number', required: false, enabled: false },
  { id: 'email', type: 'email', label: 'Email Address', required: false, enabled: false },
  { id: 'service_requested', type: 'text', label: 'Service Requested', required: false, enabled: false },
  { id: 'address', type: 'text', label: 'Address', required: false, enabled: false },
  { id: 'company', type: 'text', label: 'Company Name', required: false, enabled: false },
  { id: 'preferred_contact_time', type: 'text', label: 'Preferred Contact Time', required: false, enabled: false },
  { id: 'notes', type: 'text', label: 'Additional Notes', required: false, enabled: false },
];

export default function DataCollectionConfig({ agentId }: DataCollectionConfigProps) {
  const [fields, setFields] = useState<DataField[]>(STANDARD_FIELDS);
  const [customFields, setCustomFields] = useState<DataField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'phone' | 'email' | 'select'>('text');

  const supabase = createClient();

  // Load existing configuration
  useEffect(() => {
    loadConfig();
  }, [agentId]);

  async function loadConfig() {
    const { data, error } = await supabase
      .from('agent_data_collection_configs')
      .select('fields')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error loading config:', error);
      return;
    }

    if (data && data.fields) {
      const loadedFields = data.fields as DataField[];

      // Separate standard and custom fields
      const standard = STANDARD_FIELDS.map(sf => {
        const loaded = loadedFields.find(f => f.id === sf.id);
        return loaded ? { ...sf, enabled: loaded.enabled, required: loaded.required } : sf;
      });

      const custom = loadedFields.filter(f => f.isCustom);

      setFields(standard);
      setCustomFields(custom);
    }
  }

  function toggleField(fieldId: string) {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, enabled: !f.enabled } : f
    ));
  }

  function toggleRequired(fieldId: string) {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, required: !f.required } : f
    ));
  }

  function addCustomField() {
    if (!newFieldLabel.trim()) {
      toast.error('Please enter a field name');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newField: DataField = {
      id: customId,
      type: newFieldType,
      label: newFieldLabel,
      required: false,
      enabled: true,
      isCustom: true,
    };

    setCustomFields(prev => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldType('text');
    setShowCustomFieldForm(false);
    toast.success('Custom field added');
  }

  function removeCustomField(fieldId: string) {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success('Custom field removed');
  }

  function toggleCustomField(fieldId: string) {
    setCustomFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, enabled: !f.enabled } : f
    ));
  }

  function toggleCustomRequired(fieldId: string) {
    setCustomFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, required: !f.required } : f
    ));
  }

  async function saveConfiguration() {
    setIsSaving(true);

    try {
      // Combine all fields
      const allFields = [...fields, ...customFields];
      const enabledFields = allFields.filter(f => f.enabled);

      // Check if at least one field is selected
      if (enabledFields.length === 0) {
        toast.error('Please select at least one field to collect');
        setIsSaving(false);
        return;
      }

      // Prepare Retell analysis config
      const retellConfig = {
        extract_fields: enabledFields.map(f => ({
          name: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
        })),
      };

      // Save to database
      const { error: upsertError } = await supabase
        .from('agent_data_collection_configs')
        .upsert({
          agent_id: agentId,
          fields: allFields,
          retell_analysis_config: retellConfig,
        }, {
          onConflict: 'agent_id',
        });

      if (upsertError) throw upsertError;

      // TODO: Update Retell agent configuration via API
      // This will be done in the next step

      toast.success('Data collection settings saved!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  const enabledCount = fields.filter(f => f.enabled).length + customFields.filter(f => f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Post-Call Data Collection
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select what information you want to extract from each call
          </p>
        </div>
        <button
          onClick={saveConfiguration}
          disabled={isSaving || enabledCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Summary */}
      {enabledCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{enabledCount} field{enabledCount !== 1 ? 's' : ''}</span> will be extracted from each call
          </p>
        </div>
      )}

      {/* Standard Fields */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Standard Fields</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map(field => (
            <div
              key={field.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                field.enabled
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => toggleField(field.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {field.enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-500 mt-1">Type: {field.type}</p>

                  {field.enabled && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={() => toggleRequired(field.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Required field</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Custom Fields</h4>
          <button
            onClick={() => setShowCustomFieldForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Field
          </button>
        </div>

        {/* Custom Field Form */}
        {showCustomFieldForm && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g., Budget Range"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="phone">Phone Number</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addCustomField}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Field
                </button>
                <button
                  onClick={() => {
                    setShowCustomFieldForm(false);
                    setNewFieldLabel('');
                    setNewFieldType('text');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Fields List */}
        {customFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customFields.map(field => (
              <div
                key={field.id}
                className={`border rounded-lg p-4 transition-all ${
                  field.enabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 cursor-pointer" onClick={() => toggleCustomField(field.id)}>
                    {field.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{field.label}</p>
                        <p className="text-xs text-gray-500 mt-1">Type: {field.type} • Custom</p>
                      </div>
                      <button
                        onClick={() => removeCustomField(field.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {field.enabled && (
                      <div className="mt-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={() => toggleCustomRequired(field.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Required field</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {customFields.length === 0 && !showCustomFieldForm && (
          <p className="text-sm text-gray-500 text-center py-4">
            No custom fields yet. Click "Add Custom Field" to create one.
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">How it works</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✓ Select the fields you want to collect from each call</li>
          <li>✓ Mark important fields as "Required" if needed</li>
          <li>✓ Add custom fields for business-specific information</li>
          <li>✓ Retell AI will automatically extract this data after each call</li>
          <li>✓ View extracted data in the call history</li>
        </ul>
      </div>
    </div>
  );
}
