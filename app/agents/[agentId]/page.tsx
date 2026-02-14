'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RetellVoiceTest from './components/RetellVoiceTest';
import WelcomeModal from './components/WelcomeModal';
import TourTooltip from './components/TourTooltip';
import IntegrationModal from './components/IntegrationModal';
import { createBrowserClient } from '@/lib/supabase/client';

interface Agent {
  id: string;
  name: string;
  business_name: string;
  business_type: string;
  status: string;
  retell_agent_id?: string;
  retell_phone_number?: string;
}

interface PromptVersion {
  id: string;
  version_number: number;
  compiled_prompt: string;
  token_count: number;
  prompt_knowledge: string;
}

type Tab = 'prompt' | 'knowledge' | 'test' | 'voices' | 'calls' | 'integrations' | 'marketplace' | 'settings' | 'ai-manager' | 'scoreboard';

export default function AgentDashboard() {
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();
  const agentId = params.agentId as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState<PromptVersion | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('test');
  const [loading, setLoading] = useState(true);

  // Agent switcher state
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [showAgentSwitcher, setShowAgentSwitcher] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState<Array<{name: string, content: string}>>([]);
  const [showKBModal, setShowKBModal] = useState(false);
  const [kbSourceType, setKbSourceType] = useState<'file' | 'url' | 'manual'>('file');
  const [kbUrl, setKbUrl] = useState('');
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [isExtractingKB, setIsExtractingKB] = useState(false);
  const [extractedKBPreview, setExtractedKBPreview] = useState<{name: string, content: string} | null>(null);
  const [editingKBIndex, setEditingKBIndex] = useState<number | null>(null);
  const [editingKBName, setEditingKBName] = useState('');
  const [editingKBContent, setEditingKBContent] = useState('');
  const [showKBEditModal, setShowKBEditModal] = useState(false);

  // Settings state
  const [settingsName, setSettingsName] = useState('');
  const [settingsVoice, setSettingsVoice] = useState('11labs-Sarah');
  const [settingsStatus, setSettingsStatus] = useState('draft');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Integrations state
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [activeIntegrations, setActiveIntegrations] = useState<Array<{
    type: string;
    name: string;
    isActive: boolean;
  }>>([]);

  // Voices state
  const [retellVoices, setRetellVoices] = useState<any[]>([]);
  const [elevenlabsVoices, setElevenlabsVoices] = useState<any[]>([]);
  const [savedVoices, setSavedVoices] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedVoiceForPreview, setSelectedVoiceForPreview] = useState<any>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Calls state
  const [calls, setCalls] = useState<any[]>([]);
  const [callsAnalytics, setCallsAnalytics] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    avgDuration: 0,
    successRate: 0
  });
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [callsFilter, setCallsFilter] = useState('all');
  const [callsSearch, setCallsSearch] = useState('');
  const [isSyncingCalls, setIsSyncingCalls] = useState(false);
  const [isConfiguringWebhook, setIsConfiguringWebhook] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [showCallDetailsModal, setShowCallDetailsModal] = useState(false);
  const [callFeedback, setCallFeedback] = useState('');
  const [isProcessingCallFeedback, setIsProcessingCallFeedback] = useState(false);

  // Tour state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(1);


  // Refs for tour targets
  const testTabRef = useRef<HTMLButtonElement>(null);
  const promptTabRef = useRef<HTMLButtonElement>(null);
  const knowledgeTabRef = useRef<HTMLButtonElement>(null);
  const deployButtonRef = useRef<HTMLButtonElement>(null);
  const voiceTestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    loadAllAgents();

    // Debug logging
    console.log('Modal States:', {
      showWelcomeModal,
      isTourActive,
      showKBModal,
      showCloneModal,
      showKBEditModal,
      showIntegrationModal
    });

    // Check if user has seen the tour - DISABLED FOR NOW
    // const hasSeenTour = localStorage.getItem(`tour_completed_${agentId}`);
    // if (!hasSeenTour) {
    //   setShowWelcomeModal(true);
    // }
  }, [agentId]);

  // Load calls when calls tab is active
  useEffect(() => {
    if (activeTab === 'calls') {
      loadCalls();
    }
  }, [activeTab, callsFilter, callsSearch]);

  // Load voices when voices tab is active
  useEffect(() => {
    if (activeTab === 'voices') {
      loadVoices();
    }
  }, [activeTab]);

  async function loadData() {
    try {
      const response = await fetch(`/api/agents/${agentId}/prompt`);
      const data = await response.json();

      if (data.success) {
        setAgent(data.agent);
        setPrompt(data.promptVersion);

        // Parse knowledge base items from the prompt
        const kbItems = parseKnowledgeBase(data.promptVersion.compiled_prompt);
        setKnowledgeBaseItems(kbItems);

        // Remove KB section from edited prompt
        const promptWithoutKB = removeKnowledgeBaseSection(data.promptVersion.compiled_prompt);
        setEditedPrompt(promptWithoutKB);

        // Initialize settings
        setSettingsName(data.agent.business_name || '');
        setSettingsVoice(data.agent.voice_id || '11labs-Sarah');
        setSettingsStatus(data.agent.status || 'draft');
      }
    } catch (error) {
      console.error('Error loading agent:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllAgents() {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, business_name, business_type, status, retell_phone_number')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllAgents(data as any);
      }
    } catch (error) {
      console.error('Error loading all agents:', error);
    }
  }

  async function loadCalls() {
    setLoadingCalls(true);
    try {
      const params = new URLSearchParams({
        status: callsFilter,
        search: callsSearch,
        limit: '50',
        offset: '0'
      });

      const response = await fetch(`/api/agents/${agentId}/calls?${params}`);
      const data = await response.json();

      if (data.success) {
        setCalls(data.calls || []);
        setCallsAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoadingCalls(false);
    }
  }

  async function syncCallsFromRetell() {
    setIsSyncingCalls(true);
    try {
      const response = await fetch('/api/webhooks/retell/sync-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully synced ${data.syncedCount} new calls and updated ${data.updatedCount} existing calls!`);
        // Reload calls to show newly synced data
        await loadCalls();
      } else {
        alert(`Error syncing calls: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error syncing calls:', error);
      alert(`Error syncing calls: ${error.message}`);
    } finally {
      setIsSyncingCalls(false);
    }
  }

  async function configureWebhook() {
    setIsConfiguringWebhook(true);
    try {
      const response = await fetch('/api/webhooks/retell/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Webhook configured successfully!\n\nPrevious: ${data.previousWebhook}\nNew: ${data.newWebhook}\n\n${data.note}`);
      } else {
        alert(`Error configuring webhook: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error configuring webhook:', error);
      alert(`Error configuring webhook: ${error.message}`);
    } finally {
      setIsConfiguringWebhook(false);
    }
  }

  async function submitCallFeedback() {
    if (!callFeedback.trim() || isProcessingCallFeedback) return;

    const feedback = callFeedback.trim();
    setCallFeedback('');
    setIsProcessingCallFeedback(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Success! Prompt updated to version ${data.versionNumber}\n\n💡 Your AI has been trained based on this call!`);
      } else {
        alert(`❌ Failed to apply feedback: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('❌ Failed to apply feedback - please try again');
    } finally {
      setIsProcessingCallFeedback(false);
    }
  }

  async function loadVoices() {
    setLoadingVoices(true);

    // Helper function to fetch with timeout
    const fetchWithTimeout = async (url: string, timeout = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return await response.json();
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn(`Request to ${url} timed out`);
          return { success: false, voices: [], error: 'Timeout' };
        }
        console.error(`Error fetching ${url}:`, error);
        return { success: false, voices: [], error: error.message };
      }
    };

    try {
      // Load voices from all APIs in parallel with timeouts
      const [retellData, elevenlabsData, savedData] = await Promise.all([
        fetchWithTimeout('/api/voices/retell', 10000),
        fetchWithTimeout('/api/voices/elevenlabs', 8000),
        fetchWithTimeout(`/api/voices/saved?organization_id=${agent?.id || agentId}`, 5000)
      ]);

      if (retellData.success) {
        setRetellVoices(retellData.voices || []);
      } else {
        console.warn('Retell voices failed:', retellData.error);
        setRetellVoices([]);
      }

      if (elevenlabsData.success) {
        setElevenlabsVoices(elevenlabsData.voices || []);
      } else {
        console.warn('ElevenLabs voices failed:', elevenlabsData.error);
        setElevenlabsVoices([]);
      }

      if (savedData.success) {
        setSavedVoices(savedData.voices || []);
      } else {
        console.warn('Saved voices failed:', savedData.error);
        setSavedVoices([]);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      // Set empty arrays on error so UI doesn't stay stuck
      setRetellVoices([]);
      setElevenlabsVoices([]);
      setSavedVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  }

  function parseKnowledgeBase(promptText: string): Array<{name: string, content: string}> {
    const items: Array<{name: string, content: string}> = [];
    const kbRegex = /###\s+(KB_\w+)\s+Name:\s+(KB_\w+)\s+Content:\s+([\s\S]*?)(?=###\s+KB_|$)/g;

    let match;
    while ((match = kbRegex.exec(promptText)) !== null) {
      items.push({
        name: match[2],
        content: match[3].trim()
      });
    }

    return items;
  }

  function removeKnowledgeBaseSection(promptText: string): string {
    // Remove everything from "## KNOWLEDGE BASE CONTENT" onwards
    const kbSectionStart = promptText.indexOf('## KNOWLEDGE BASE CONTENT');
    if (kbSectionStart !== -1) {
      return promptText.substring(0, kbSectionStart).trim();
    }

    // Also try to remove if it's "## 6. Knowledge Base"
    const kb6Start = promptText.indexOf('## 6. Knowledge Base');
    if (kb6Start !== -1) {
      const contentStart = promptText.indexOf('## KNOWLEDGE BASE CONTENT', kb6Start);
      if (contentStart !== -1) {
        return promptText.substring(0, kb6Start).trim() + '\n\n' + promptText.substring(kb6Start, contentStart).trim();
      }
    }

    return promptText;
  }

  async function extractKBFromSource() {
    setIsExtractingKB(true);
    try {
      let content = '';
      let sourceDescription = '';

      if (kbSourceType === 'url') {
        // Fetch and extract content from URL
        const response = await fetch(`/api/agents/${agentId}/kb/extract-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: kbUrl })
        });
        const data = await response.json();
        if (data.success) {
          content = data.content;
          sourceDescription = `from ${kbUrl}`;
        }
      } else if (kbSourceType === 'file' && kbFile) {
        // Upload file and extract content
        const formData = new FormData();
        formData.append('file', kbFile);
        const response = await fetch(`/api/agents/${agentId}/kb/extract-file`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          content = data.content;
          sourceDescription = `from ${kbFile.name}`;
        }
      }

      // Generate KB item name and format content using Claude
      const response = await fetch(`/api/agents/${agentId}/kb/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          sourceDescription,
          agentContext: agent?.business_type
        })
      });

      const data = await response.json();
      if (data.success) {
        setExtractedKBPreview({
          name: data.name,
          content: data.formattedContent
        });
      }
    } catch (error) {
      console.error('Error extracting KB:', error);
      alert('Failed to extract content. Please try again.');
    } finally {
      setIsExtractingKB(false);
    }
  }

  async function saveKBItem() {
    if (!extractedKBPreview) return;

    // Add KB item to the prompt
    const response = await fetch(`/api/agents/${agentId}/kb/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: extractedKBPreview.name,
        content: extractedKBPreview.content
      })
    });

    const data = await response.json();
    if (data.success) {
      // Reload data to show new KB item
      await loadData();
      setShowKBModal(false);
      setExtractedKBPreview(null);
      setKbUrl('');
      setKbFile(null);
    }
  }

  async function savePromptChanges() {
    if (!editedPrompt) return;

    setIsSavingPrompt(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/prompt/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiledPrompt: editedPrompt,
          changeSummary: 'Manual edit via dashboard'
        })
      });

      const data = await response.json();
      if (data.success) {
        // Reload to get new version
        await loadData();
        setIsEditing(false);
        alert(`Prompt saved! Now on version ${data.versionNumber}`);
      } else {
        alert('Failed to save prompt: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt');
    } finally {
      setIsSavingPrompt(false);
    }
  }

  // Tour functions
  function startTour() {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    setCurrentTourStep(1);
    setActiveTab('test'); // Start on test tab
  }

  function skipTour() {
    setShowWelcomeModal(false);
    localStorage.setItem(`tour_completed_${agentId}`, 'true');
  }

  function nextTourStep() {
    if (currentTourStep < 6) {
      const nextStep = currentTourStep + 1;
      setCurrentTourStep(nextStep);

      // Auto-switch tabs for relevant steps
      if (nextStep === 2) setActiveTab('test');
      if (nextStep === 3) setActiveTab('prompt');
      if (nextStep === 4) setActiveTab('knowledge');
    }
  }

  function prevTourStep() {
    if (currentTourStep > 1) {
      const prevStep = currentTourStep - 1;
      setCurrentTourStep(prevStep);

      // Auto-switch tabs
      if (prevStep === 1) setActiveTab('test');
      if (prevStep === 2) setActiveTab('test');
      if (prevStep === 3) setActiveTab('prompt');
    }
  }

  function closeTour() {
    setIsTourActive(false);
    localStorage.setItem(`tour_completed_${agentId}`, 'true');
  }

  function restartTour() {
    setCurrentTourStep(1);
    setActiveTab('test');
    setIsTourActive(true);
  }

  function startEditKB(index: number) {
    const item = knowledgeBaseItems[index];
    setEditingKBIndex(index);
    setEditingKBName(item.name.replace('KB_', '').replace(/_/g, ' '));
    setEditingKBContent(item.content);
    setShowKBEditModal(true);
  }

  async function saveKBEdit() {
    if (editingKBIndex === null) return;

    // Update the KB item in the array
    const updatedItems = [...knowledgeBaseItems];
    const formattedName = `KB_${editingKBName.trim().replace(/\s+/g, '_').toUpperCase()}`;
    updatedItems[editingKBIndex] = {
      name: formattedName,
      content: editingKBContent.trim()
    };

    // Update state
    setKnowledgeBaseItems(updatedItems);

    // Save to prompt
    await saveKBToPrompt(updatedItems);

    // Close modal
    setShowKBEditModal(false);
    setEditingKBIndex(null);
    setEditingKBName('');
    setEditingKBContent('');
  }

  async function deleteKBItem(index: number) {
    if (!confirm('Are you sure you want to delete this knowledge base item?')) return;

    const updatedItems = knowledgeBaseItems.filter((_, i) => i !== index);
    setKnowledgeBaseItems(updatedItems);

    // Save to prompt
    await saveKBToPrompt(updatedItems);
  }

  async function saveKBToPrompt(items: Array<{name: string, content: string}>) {
    if (!prompt) return;

    // Build KB section
    let kbSection = '';
    if (items.length > 0) {
      kbSection = '\n\n# Knowledge Base\n\n';
      items.forEach(item => {
        kbSection += `### ${item.name}\nName: ${item.name}\nContent: ${item.content}\n\n`;
      });
    }

    // Get current prompt without KB section
    const promptWithoutKB = removeKnowledgeBaseSection(prompt.compiled_prompt);

    // Combine
    const newPrompt = promptWithoutKB + kbSection;

    // Save via API
    try {
      const response = await fetch(`/api/agents/${agentId}/prompt/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiledPrompt: newPrompt,
          changeSummary: 'Updated Knowledge Base items'
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadData(); // Reload to get updated prompt
        alert('Knowledge Base updated successfully!');
      }
    } catch (error) {
      console.error('Error saving KB:', error);
      alert('Failed to save Knowledge Base changes');
    }
  }

  async function saveVoiceToLibrary(voice: any) {
    try {
      const response = await fetch('/api/voices/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: agent?.id || agentId,
          ...voice
        })
      });

      const data = await response.json();
      if (data.success) {
        setSavedVoices([...savedVoices, data.voice]);
        alert('Voice saved to your library!');
      } else {
        alert(data.error || 'Failed to save voice');
      }
    } catch (error) {
      console.error('Error saving voice:', error);
      alert('Failed to save voice');
    }
  }

  // Generate profile image based on voice metadata
  function getVoiceProfileImage(voice: any) {
    // Use UI Avatars API to generate realistic profile pictures
    const name = voice.voice_name || 'Voice';
    const gender = voice.gender || 'neutral';
    const age = voice.age || 'middle';

    // Generate seed based on voice characteristics for consistency
    const seed = `${name}${gender}${age}`.toLowerCase().replace(/\s/g, '');

    // Use DiceBear API for realistic avatars (micah style looks like real people)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
  }

  function playVoicePreview(voice: any) {
    if (!voice.preview_audio_url) {
      alert('No preview available for this voice');
      return;
    }

    // Stop currently playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
      setPlayingVoiceId(null);
    }

    // If clicking the same voice, just stop
    if (playingVoiceId === voice.voice_id) {
      return;
    }

    console.log('Playing preview for:', voice.voice_name, voice.preview_audio_url);

    const audio = new Audio(voice.preview_audio_url);
    audioPlayerRef.current = audio;
    setPlayingVoiceId(voice.voice_id);

    // Add event listeners
    audio.addEventListener('ended', () => {
      setPlayingVoiceId(null);
      audioPlayerRef.current = null;
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e, audio.error);
      setPlayingVoiceId(null);
      audioPlayerRef.current = null;
      alert(`Failed to play preview: ${audio.error?.message || 'Unknown error'}. The audio file may be blocked or unavailable.`);
    });

    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayingVoiceId(null);
      audioPlayerRef.current = null;
      alert(`Failed to play preview: ${err.message}. Your browser may be blocking autoplay.`);
    });
  }

  async function saveSettings() {
    setIsSavingSettings(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: settingsName,
          voice_id: settingsVoice,
          status: settingsStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadData(); // Reload agent data
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  }

  const tourSteps = [
    {
      ref: testTabRef,
      title: '🧪 Test Your Agent',
      description: 'Start here to try out your AI agent with voice or text conversations. This is the best way to see how your agent will perform with real customers.',
      position: 'right' as const
    },
    {
      ref: voiceTestRef,
      title: '💬 Training Mode',
      description: 'Toggle between Test Mode (just try it out) and Training Mode (give feedback to improve your agent). In Training Mode, any feedback you provide will automatically update your agent\'s prompt.',
      position: 'top' as const
    },
    {
      ref: promptTabRef,
      title: '📝 View & Edit Prompts',
      description: 'Your agent\'s conversation prompt is here. You can view it in a beautifully formatted view or click Edit to make manual changes. Each edit creates a new version so you can always roll back.',
      position: 'right' as const
    },
    {
      ref: knowledgeTabRef,
      title: '📚 Knowledge Base',
      description: 'Add information your agent should know by uploading files, pasting URLs, or typing manually. We\'ll automatically extract and format the content for your agent to reference.',
      position: 'right' as const
    },
    {
      ref: deployButtonRef,
      title: '🚀 Deploy Your Agent',
      description: 'When you\'re happy with how your agent performs, click here to get a phone number and go live. You\'ll be able to forward calls from your existing number.',
      position: 'bottom' as const
    }
  ];

  const currentStep = tourSteps[currentTourStep - 1];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!agent || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent not found</h2>
          <p className="text-gray-600 mb-6">This agent may have been deleted or doesn't exist</p>
          <button
            onClick={() => router.push('/agents')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View All Agents
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    testing: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    active: 'bg-green-100 text-green-700 border-green-300',
    paused: 'bg-orange-100 text-orange-700 border-orange-300'
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Modern Header Bar with Gradient */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Agent Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAgentSwitcher(!showAgentSwitcher)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-4 py-2 transition-all"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-3xl">🤖</span>
                      {agent.business_name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {agent.business_type}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">Version {prompt.version_number}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">{prompt.token_count} words</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showAgentSwitcher ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showAgentSwitcher && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAgentSwitcher(false)}></div>
                    <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-20 max-h-96 overflow-y-auto">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3 px-2">
                          <p className="text-sm font-bold text-gray-500 uppercase">Switch Agent</p>
                          <button
                            onClick={() => {
                              router.push('/marketplace');
                              setShowAgentSwitcher(false);
                            }}
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                          >
                            ➕ New
                          </button>
                        </div>
                        {allAgents.map(a => (
                          <button
                            key={a.id}
                            onClick={() => {
                              router.push(`/agents/${a.id}`);
                              setShowAgentSwitcher(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl hover:bg-blue-50 transition-all mb-1 ${
                              a.id === agentId ? 'bg-blue-100 border-2 border-blue-300' : 'border-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{a.business_name}</p>
                                <p className="text-sm text-gray-500 capitalize">{a.business_type}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {a.retell_phone_number && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                    📞 Active
                                  </span>
                                )}
                                {a.id === agentId && (
                                  <span className="text-blue-600">✓</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Help Menu */}
              <div className="relative group">
                <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                  <span className="text-xl">❓</span>
                </button>
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 w-64 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                  <button
                    onClick={restartTour}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg font-medium text-gray-700 transition-all flex items-center gap-2"
                  >
                    <span className="text-xl">🎯</span>
                    Restart Interactive Tour
                  </button>
                  <a
                    href="/docs"
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg font-medium text-gray-700 transition-all flex items-center gap-2 mt-1"
                  >
                    <span className="text-xl">📚</span>
                    View Documentation
                  </a>
                  <a
                    href="/support"
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg font-medium text-gray-700 transition-all flex items-center gap-2 mt-1"
                  >
                    <span className="text-xl">💬</span>
                    Contact Support
                  </a>
                </div>
              </div>

              <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize border-2 ${statusColors[agent.status as keyof typeof statusColors] || statusColors.draft}`}>
                {agent.status}
              </span>
              <button
                ref={deployButtonRef}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
              >
                🚀 Deploy Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex h-[calc(100vh-97px)]">
        {/* Elegant Sidebar Navigation */}
        <div className="w-72 h-full bg-white border-r border-gray-200 shadow-sm">
          <nav className="p-6 space-y-2">
            {[
              { id: 'test', icon: '🧪', label: 'Test Agent', badge: null, ref: testTabRef },
              { id: 'prompt', icon: '📝', label: 'Prompt', badge: null, ref: promptTabRef },
              { id: 'knowledge', icon: '📚', label: 'Knowledge Base', badge: 'Beta', ref: knowledgeTabRef },
              { id: 'voices', icon: '🎙️', label: 'Voices', badge: 'New', ref: null },
              { id: 'calls', icon: '📞', label: 'Call History', badge: null, ref: null },
              { id: 'ai-manager', icon: '🤖', label: 'AI Manager', badge: null, ref: null },
              { id: 'integrations', icon: '🔌', label: 'Integrations', badge: null, ref: null },
              { id: 'marketplace', icon: '🛒', label: 'Marketplace', badge: null, ref: null },
              { id: 'scoreboard', icon: '🏆', label: 'AI Scoreboard', badge: 'New', ref: null },
              { id: 'settings', icon: '⚙️', label: 'Settings', badge: null, ref: null }
            ].map(tab => (
              <button
                key={tab.id}
                ref={tab.ref as any}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all group relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${activeTab === tab.id ? '' : 'group-hover:scale-110 transition-transform'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </button>
            ))}
          </nav>

        </div>

        {/* Main Content Panel with Modern Cards */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
          {/* Test Agent Tab */}
          {activeTab === 'test' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Your Agent</h2>
                <p className="text-gray-600">Try out your agent with voice or text to see how it performs</p>
              </div>
              <div ref={voiceTestRef} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <RetellVoiceTest agentId={agentId} />
              </div>
            </div>
          )}

          {/* Prompt Tab */}
          {activeTab === 'prompt' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">📝 Agent Prompt</h2>
                  <p className="text-gray-600">View and edit your agent's conversation prompt</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                  }`}
                >
                  {isEditing ? '✖️ Cancel' : '✏️ Edit Prompt'}
                </button>
              </div>

              {isEditing ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full h-[600px] p-5 border-2 border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={savePromptChanges}
                      disabled={isSavingPrompt}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingPrompt ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditedPrompt(prompt.compiled_prompt);
                        setIsEditing(false);
                      }}
                      className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <div className="prose prose-slate max-w-none">
                    {editedPrompt.split('\n').map((line, idx) => {
                      // Headers
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-blue-200">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-blue-300">{line.replace('# ', '')}</h1>;
                      }

                      // Bold patterns
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx} className="font-bold text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>;
                      }

                      // Code blocks or special formatting
                      if (line.startsWith('[') || line.includes('call ') || line.includes('function')) {
                        return <p key={idx} className="font-mono text-sm bg-gray-50 text-blue-800 px-3 py-1 rounded my-1 border-l-4 border-blue-400">{line}</p>;
                      }

                      // Quotes
                      if (line.startsWith('"') && line.endsWith('"')) {
                        return <p key={idx} className="italic text-gray-700 bg-blue-50 px-4 py-2 rounded-lg border-l-4 border-blue-500 my-2">{line}</p>;
                      }

                      // Empty lines
                      if (line.trim() === '') {
                        return <div key={idx} className="h-2"></div>;
                      }

                      // Regular paragraphs
                      return <p key={idx} className="text-gray-700 leading-relaxed my-2">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 Knowledge Base</h2>
                  <p className="text-gray-600">Information your agent can reference during conversations</p>
                </div>
                <button
                  onClick={() => setShowKBModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  ➕ Add New Item
                </button>
              </div>

              {knowledgeBaseItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Knowledge Base Items Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Add knowledge base items to help your agent answer specific questions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledgeBaseItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:border-blue-300">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {item.name.replace('KB_', '').charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {item.name.replace('KB_', '').replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-500">Reference ID: {item.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditKB(idx)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-all"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteKBItem(idx)}
                              className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-all"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="prose prose-slate max-w-none">
                          {item.content.split('\n').map((line, lineIdx) => {
                            if (line.trim() === '') return <div key={lineIdx} className="h-2"></div>;

                            // Headers in content
                            if (line.toUpperCase() === line && line.trim().length > 0 && !line.includes(':')) {
                              return <h4 key={lineIdx} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line}</h4>;
                            }

                            // List items
                            if (line.trim().startsWith('-')) {
                              return (
                                <div key={lineIdx} className="flex items-start gap-2 my-1">
                                  <span className="text-blue-600 font-bold mt-1">•</span>
                                  <span className="text-gray-700">{line.replace(/^-\s*/, '')}</span>
                                </div>
                              );
                            }

                            // Regular lines
                            return <p key={lineIdx} className="text-gray-700 leading-relaxed my-1">{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🔌 Integrations</h2>
                <p className="text-gray-600">Connect your agent to external services to automate workflows</p>
              </div>

              {/* Active Integrations */}
              {activeIntegrations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Active Integrations</h3>
                  <div className="space-y-3">
                    {activeIntegrations.map((integration, idx) => (
                      <div key={idx} className="bg-white rounded-xl border-2 border-green-200 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">✓</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-500">Connected and active</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all">
                            ⚙️ Settings
                          </button>
                          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all">
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Integrations - Calendars */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Calendar Integrations
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Google Calendar */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          G
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Google Calendar</h4>
                          <p className="text-gray-600 mb-3">Allow your agent to check availability and book appointments directly in Google Calendar</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Check availability</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Book appointments</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Send confirmations</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedIntegration('google-calendar');
                          setShowIntegrationModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all whitespace-nowrap"
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  {/* Calendly */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          C
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Calendly</h4>
                          <p className="text-gray-600 mb-3">Share your Calendly link during calls and let customers book appointments</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Share booking link</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Check availability</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✓ Event tracking</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedIntegration('calendly');
                          setShowIntegrationModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all whitespace-nowrap"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Integrations */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  CRM & Sales Automation
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* GoHighLevel */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          GHL
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">GoHighLevel</h4>
                          <p className="text-gray-600 mb-3">Automatically add leads, update pipelines, and trigger workflows in your GHL account</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">✓ Create contacts</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">✓ Update opportunities</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">✓ Trigger workflows</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">✓ Log calls</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedIntegration('gohighlevel');
                          setShowIntegrationModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg shadow-purple-600/30 transition-all whitespace-nowrap"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-8 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">More Integrations Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  We're adding HubSpot, Salesforce, Square, Shopify, and more. <br />
                  Need a specific integration? Let us know!
                </p>
                <button className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 font-semibold transition-all">
                  Request an Integration
                </button>
              </div>
            </div>
          )}

          {/* Call History Tab */}
          {activeTab === 'calls' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">📞 Call History & Analytics</h2>
                <p className="text-gray-600">Track calls, view transcripts, and analyze performance</p>
              </div>

              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 font-semibold text-sm">Total Calls</span>
                    <span className="text-3xl">📞</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-900 mb-1">{callsAnalytics.totalCalls}</div>
                  <div className="text-sm text-blue-600">This month</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border-2 border-green-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 font-semibold text-sm">Total Minutes</span>
                    <span className="text-3xl">⏱️</span>
                  </div>
                  <div className="text-4xl font-bold text-green-900 mb-1">{callsAnalytics.totalMinutes}</div>
                  <div className="text-sm text-green-600">This month</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-600 font-semibold text-sm">Avg Duration</span>
                    <span className="text-3xl">⏰</span>
                  </div>
                  <div className="text-4xl font-bold text-purple-900 mb-1">{callsAnalytics.avgDuration}m</div>
                  <div className="text-sm text-purple-600">Per call</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg border-2 border-orange-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-600 font-semibold text-sm">Success Rate</span>
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="text-4xl font-bold text-orange-900 mb-1">{callsAnalytics.successRate}%</div>
                  <div className="text-sm text-orange-600">Completed calls</div>
                </div>
              </div>

              {/* Call History Table */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Recent Calls</h3>
                    <div className="flex gap-3">
                      <select
                        value={callsFilter}
                        onChange={(e) => setCallsFilter(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Calls</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="failed">Failed</option>
                      </select>
                      <input
                        type="text"
                        value={callsSearch}
                        onChange={(e) => setCallsSearch(e.target.value)}
                        placeholder="Search by phone number..."
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {loadingCalls ? (
                  <div className="p-16 text-center">
                    <div className="text-6xl mb-6">⏳</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading calls...</h3>
                  </div>
                ) : calls.length === 0 ? (
                  /* Empty State */
                  <div className="p-16 text-center">
                  <div className="text-6xl mb-6">📞</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No calls yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Once your agent is activated and starts receiving calls, they'll appear here with full transcripts and analytics.
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
                    <h4 className="font-bold text-gray-900 mb-2">💡 What you'll see here:</h4>
                    <ul className="text-left text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Call Details:</strong> Date, time, duration, phone numbers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Full Transcripts:</strong> Word-for-word conversation logs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Audio Recordings:</strong> Playback and download options</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>AI Analysis:</strong> Sentiment, outcome, key insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Quick Actions:</strong> Improve prompt based on specific calls</span>
                      </li>
                    </ul>
                  </div>
                </div>
                ) : (
                  /* Calls Table */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date & Time</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">From</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Duration</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {calls.map((call: any) => (
                          <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(call.started_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(call.started_at).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{call.from_number || 'Unknown'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {call.duration_ms ? `${Math.ceil(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                call.call_status === 'completed' ? 'bg-green-100 text-green-700' :
                                call.call_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {call.call_status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedCall(call);
                                  setShowCallDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voices Tab */}
          {activeTab === 'voices' && (
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    Voice Library
                  </h2>
                  <p className="text-lg text-gray-600">Discover the perfect voice for your AI agent</p>
                </div>
                <button
                  onClick={() => setShowCloneModal(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white rounded-2xl font-bold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🎤</span>
                    Clone Your Voice
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Provider Filter Tabs - Redesigned */}
              <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-3">
                {['all', 'elevenlabs', 'retell', 'saved', 'cloned'].map(provider => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`group relative px-8 py-4 rounded-2xl font-bold capitalize transition-all duration-300 whitespace-nowrap ${
                      selectedProvider === provider
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/40 scale-105'
                        : 'bg-white text-gray-700 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-base">
                      {provider === 'all' ? '🌐' :
                       provider === 'elevenlabs' ? '🎵' :
                       provider === 'retell' ? '📡' :
                       provider === 'saved' ? '⭐' :
                       '🎤'}
                      {provider === 'all' ? 'All Voices' :
                       provider === 'elevenlabs' ? 'ElevenLabs' :
                       provider === 'retell' ? 'Retell' :
                       provider === 'saved' ? 'Favorites' :
                       'Cloned'}
                    </span>
                    {selectedProvider !== provider && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loadingVoices && (
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl border-2 border-blue-200/50 p-20 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-purple-600/30 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Loading Voices...</h3>
                  <p className="text-gray-600 font-medium">Fetching premium voices from multiple providers</p>
                </div>
              )}

              {/* Voice Grid */}
              {!loadingVoices && (
                <>
                  {/* Saved Voices Section */}
                  {(selectedProvider === 'all' || selectedProvider === 'saved') && savedVoices.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                        <span className="text-3xl">⭐</span>
                        Your Favorites
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedVoices
                          .filter(voice => selectedProvider === 'all' || selectedProvider === 'saved')
                          .map((voice, idx) => (
                            <div key={idx} className="group relative bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/30 rounded-3xl shadow-xl border-2 border-yellow-200/50 p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
                              {/* Animated background gradient */}
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-orange-400/0 to-red-400/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                              {/* Favorite badge */}
                              <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-lg z-10">
                                ⭐ FAVORITE
                              </div>

                              {/* Profile section */}
                              <div className="relative mb-5">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img
                                      src={getVoiceProfileImage(voice)}
                                      alt={voice.voice_name}
                                      className="w-20 h-20 rounded-full shadow-lg ring-4 ring-yellow-200/50 object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-xl font-black text-gray-900 mb-1">{voice.voice_name}</h4>
                                    <p className="text-sm font-semibold text-yellow-600 capitalize">{voice.provider}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Voice details */}
                              <div className="space-y-2.5 mb-6">
                                {voice.gender && (
                                  <div className="flex items-center gap-3 px-3 py-2 bg-white/70 rounded-xl">
                                    <span className="text-gray-500 text-sm font-medium min-w-[60px]">Gender:</span>
                                    <span className="font-bold text-gray-900 capitalize">{voice.gender}</span>
                                  </div>
                                )}
                                {voice.accent && (
                                  <div className="flex items-center gap-3 px-3 py-2 bg-white/70 rounded-xl">
                                    <span className="text-gray-500 text-sm font-medium min-w-[60px]">Accent:</span>
                                    <span className="font-bold text-gray-900">{voice.accent}</span>
                                  </div>
                                )}
                                {voice.age && (
                                  <div className="flex items-center gap-3 px-3 py-2 bg-white/70 rounded-xl">
                                    <span className="text-gray-500 text-sm font-medium min-w-[60px]">Age:</span>
                                    <span className="font-bold text-gray-900 capitalize">{voice.age}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-3">
                                <button
                                  onClick={() => playVoicePreview(voice)}
                                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                  <span className="text-lg">▶️</span>
                                  Preview
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Remove this voice from your favorites?')) {
                                      const response = await fetch(`/api/voices/saved?voice_id=${voice.voice_id}&organization_id=${agent?.id || agentId}`, {
                                        method: 'DELETE'
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        setSavedVoices(savedVoices.filter(v => v.voice_id !== voice.voice_id));
                                        alert('Voice removed from favorites');
                                      }
                                    }
                                  }}
                                  className="px-5 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                                >
                                  <span className="text-lg">🗑️</span>
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* ElevenLabs Voices */}
                  {(selectedProvider === 'all' || selectedProvider === 'elevenlabs') && elevenlabsVoices.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                        <span className="text-3xl">🎵</span>
                        ElevenLabs Premium Voices
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {elevenlabsVoices.map((voice, idx) => (
                          <div key={idx} className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-7 hover:shadow-2xl hover:scale-105 hover:border-blue-300 transition-all duration-300 overflow-hidden">
                            {/* Animated background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                            {/* Provider badge */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-black rounded-full shadow-lg z-10">
                              🎵 ELEVENLABS
                            </div>

                            {/* Profile section */}
                            <div className="relative mb-5">
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={getVoiceProfileImage(voice)}
                                    alt={voice.voice_name}
                                    className="w-20 h-20 rounded-full shadow-lg ring-4 ring-blue-200/50 object-cover"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-bold">AI</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 pr-20">
                                  <h4 className="text-lg font-black text-gray-900 mb-1 truncate">{voice.voice_name}</h4>
                                  <p className="text-sm font-semibold text-blue-600">ElevenLabs</p>
                                </div>
                              </div>
                            </div>

                            {/* Voice details */}
                            <div className="space-y-2.5 mb-6">
                              {voice.gender && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[70px]">Gender:</span>
                                  <span className="font-bold text-gray-900 capitalize">{voice.gender}</span>
                                </div>
                              )}
                              {voice.accent && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[70px]">Accent:</span>
                                  <span className="font-bold text-gray-900">{voice.accent}</span>
                                </div>
                              )}
                              {voice.use_case && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[70px]">Use Case:</span>
                                  <span className="font-bold text-gray-900 capitalize">{voice.use_case}</span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 relative z-20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Preview button clicked for:', voice.voice_name);
                                  playVoicePreview(voice);
                                }}
                                className={`flex-1 px-5 py-3.5 ${
                                  playingVoiceId === voice.voice_id
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 animate-pulse'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                } text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2`}
                              >
                                <span className="text-lg">{playingVoiceId === voice.voice_id ? '⏸️' : '▶️'}</span>
                                {playingVoiceId === voice.voice_id ? 'Playing...' : 'Preview'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveVoiceToLibrary(voice);
                                }}
                                className="px-5 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 rounded-xl font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 flex items-center justify-center"
                              >
                                <span className="text-lg">⭐</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Retell Voices */}
                  {(selectedProvider === 'all' || selectedProvider === 'retell') && retellVoices.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                        <span className="text-3xl">📡</span>
                        Retell Multi-Provider Voices
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {retellVoices.map((voice, idx) => (
                          <div key={idx} className="group relative bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-7 hover:shadow-2xl hover:scale-105 hover:border-green-300 transition-all duration-300 overflow-hidden">
                            {/* Animated background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-teal-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                            {/* Provider badge */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-black rounded-full shadow-lg z-10 capitalize">
                              📡 {voice.provider || 'RETELL'}
                            </div>

                            {/* Profile section */}
                            <div className="relative mb-5">
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={getVoiceProfileImage(voice)}
                                    alt={voice.voice_name}
                                    className="w-20 h-20 rounded-full shadow-lg ring-4 ring-green-200/50 object-cover"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-bold">✓</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 pr-20">
                                  <h4 className="text-lg font-black text-gray-900 mb-1 truncate">{voice.voice_name}</h4>
                                  <p className="text-sm font-semibold text-green-600 capitalize">{voice.provider || 'Retell'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Voice details */}
                            <div className="space-y-2.5 mb-6">
                              {voice.gender && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[60px]">Gender:</span>
                                  <span className="font-bold text-gray-900 capitalize">{voice.gender}</span>
                                </div>
                              )}
                              {voice.accent && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[60px]">Accent:</span>
                                  <span className="font-bold text-gray-900">{voice.accent}</span>
                                </div>
                              )}
                              {voice.age && (
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl">
                                  <span className="text-gray-500 text-sm font-medium min-w-[60px]">Age:</span>
                                  <span className="font-bold text-gray-900 capitalize">{voice.age}</span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => playVoicePreview(voice)}
                                className="flex-1 px-5 py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <span className="text-lg">▶️</span>
                                Preview
                              </button>
                              <button
                                onClick={() => saveVoiceToLibrary(voice)}
                                className="px-5 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 rounded-xl font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 flex items-center justify-center"
                              >
                                <span className="text-lg">⭐</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {((selectedProvider === 'all' && retellVoices.length === 0 && elevenlabsVoices.length === 0 && savedVoices.length === 0) ||
                    (selectedProvider === 'saved' && savedVoices.length === 0) ||
                    (selectedProvider === 'elevenlabs' && elevenlabsVoices.length === 0) ||
                    (selectedProvider === 'retell' && retellVoices.length === 0)) && (
                    <div className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-3xl shadow-2xl border-2 border-gray-200 p-20 text-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                      <div className="relative">
                        <div className="text-8xl mb-6 animate-pulse">🎙️</div>
                        <h3 className="text-3xl font-black bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">No Voices Found</h3>
                        <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                          {selectedProvider === 'saved'
                            ? 'Click the ⭐ button on any voice to add it to your favorites'
                            : 'Try selecting a different provider or check your internet connection'}
                        </p>
                        {selectedProvider === 'saved' && (
                          <button
                            onClick={() => setSelectedProvider('all')}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                          >
                            Browse All Voices
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}


          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🛒 Agent Marketplace</h2>
                <p className="text-gray-600">Browse and explore pre-built AI agent templates</p>
              </div>

              {/* Homevanna Template */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group relative bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl"></div>

                  {/* Content */}
                  <div className="relative">
                    {/* Icon & Title */}
                    <div className="mb-6">
                      <div className="text-7xl mb-4">🏡</div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Homevanna AI
                      </h3>
                      <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Real Estate</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      Smart real estate AI agent for instant property valuations using RentCast AVM API
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-600 mb-3">Key Features:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Instant property valuations via RentCast API</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Natural conversational interface</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Pre-configured prompts & knowledge base</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Ready-to-deploy in minutes</span>
                        </li>
                      </ul>
                    </div>

                    {/* Pricing Badge */}
                    <div className="mb-6">
                      <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                        Coming Soon
                      </span>
                    </div>

                    {/* View Details Button */}
                    <button
                      className="w-full px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <span>👁️</span>
                      View Template
                    </button>
                  </div>
                </div>

                {/* More templates coming soon placeholder */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">More Templates Coming</h3>
                  <p className="text-gray-500">
                    We're adding new agent templates regularly. Check back soon!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Scoreboard Tab */}
          {activeTab === 'scoreboard' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-10">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                  🏆 AI Scoreboard
                </h2>
                <p className="text-lg text-gray-600">Track your AI's performance and evolution</p>
              </div>

              {/* AI Evolution Progress */}
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 mb-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">AI Evolution Level</h3>
                    <p className="text-purple-100">Earn points through successful interactions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl mb-2">👶</div>
                    <p className="text-white font-bold">AI Infant</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-8 overflow-hidden backdrop-blur-sm mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-full flex items-center justify-center transition-all duration-500" style={{ width: '0%' }}>
                    <span className="text-white font-bold text-sm">0 / 500</span>
                  </div>
                </div>

                {/* Evolution Stages */}
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border-2 border-white/30">
                    <div className="text-2xl mb-1">👶</div>
                    <p className="text-xs text-white font-bold">AI Infant</p>
                    <p className="text-xs text-purple-200">0-100</p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 opacity-50">
                    <div className="text-2xl mb-1">🧒</div>
                    <p className="text-xs text-white font-bold">AI Kid</p>
                    <p className="text-xs text-purple-200">101-200</p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 opacity-50">
                    <div className="text-2xl mb-1">👨‍💼</div>
                    <p className="text-xs text-white font-bold">AI Pro</p>
                    <p className="text-xs text-purple-200">201-300</p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 opacity-50">
                    <div className="text-2xl mb-1">🦸</div>
                    <p className="text-xs text-white font-bold">AI Hero</p>
                    <p className="text-xs text-purple-200">301-400</p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 opacity-50">
                    <div className="text-2xl mb-1">💪</div>
                    <p className="text-xs text-white font-bold">AI Chad</p>
                    <p className="text-xs text-purple-200">401-500</p>
                  </div>
                </div>

                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white text-sm mb-2">
                    <strong>🎁 AI Chad Exclusive Benefits:</strong>
                  </p>
                  <ul className="text-white text-sm space-y-1 ml-4">
                    <li>🎓 Free advanced training & workshops</li>
                    <li>🔓 Early access to new features & unlocks</li>
                    <li>💎 Exclusive marketplace discounts</li>
                  </ul>
                </div>
              </div>

              {/* Point Rules */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>📋</span> How to Earn Points
                  </h3>
                  <p className="text-blue-100 mt-1">Every action counts towards your AI's evolution</p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Successful Call</h4>
                            <p className="text-sm text-gray-600">Call completed successfully</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-green-600">+1</p>
                          <p className="text-xs text-gray-500">point</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Prompt Adjustment</h4>
                            <p className="text-sm text-gray-600">Script improvement approved</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-purple-600">+1</p>
                          <p className="text-xs text-gray-500">point</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Scheduled Appointment</h4>
                            <p className="text-sm text-gray-600">Meeting booked successfully</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-blue-600">+2</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Deal Closed</h4>
                            <p className="text-sm text-gray-600">Customer converted to sale</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-yellow-600">+3</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>📊</span> Recent Activity
                  </h3>
                  <p className="text-gray-300 mt-1">Track your latest point-earning actions</p>
                </div>

                <div className="p-8">
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No activity yet</h4>
                    <p className="text-gray-600">
                      Start making calls and improving your AI to earn points!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Manager Tab */}
          {activeTab === 'ai-manager' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-10">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                  🤖 AI Manager
                </h2>
                <p className="text-lg text-gray-600">Weekly call analysis and automated script improvements</p>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                    <span className="text-3xl">📊</span>
                  </div>
                  <p className="text-3xl font-extrabold text-purple-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Calls Analyzed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Pending</h3>
                    <span className="text-3xl">⏳</span>
                  </div>
                  <p className="text-3xl font-extrabold text-blue-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Script Changes</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Approved</h3>
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-3xl font-extrabold text-green-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">This Month</p>
                </div>
              </div>

              {/* Pending Script Changes Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>📝</span> Pending Script Improvements
                  </h3>
                  <p className="text-purple-100 mt-1">AI-generated suggestions based on call analysis</p>
                </div>

                <div className="p-8">
                  {/* Empty State */}
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🤖</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No pending changes yet</h4>
                    <p className="text-gray-600 mb-6">
                      The AI Manager analyzes your calls every week and suggests script improvements.
                    </p>
                    <div className="inline-block bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                      <p className="text-sm text-gray-700">
                        <strong>Next analysis:</strong> Every Monday at 9:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span>💡</span> How AI Manager Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📞</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">1. Analyze Calls</h4>
                    <p className="text-sm text-gray-600">
                      Reviews all call transcripts from the week to identify patterns and areas for improvement
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">2. Generate Changes</h4>
                    <p className="text-sm text-gray-600">
                      AI suggests specific script improvements based on successful conversation patterns
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">3. You Approve</h4>
                    <p className="text-sm text-gray-600">
                      Review suggested changes and approve to automatically update your agent's script
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Agent Settings</h2>
                <p className="text-gray-600">Configure your agent's behavior and voice</p>
              </div>

              {/* Agent IDs Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔑</span>
                  Agent Identifiers
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Internal Agent ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={agentId}
                        readOnly
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 font-mono text-sm text-gray-700"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(agentId);
                          alert('Agent ID copied to clipboard!');
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use this ID for API calls and webhooks</p>
                  </div>

                  {agent.retell_agent_id && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Retell Agent ID
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={agent.retell_agent_id}
                          readOnly
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 font-mono text-sm text-gray-700"
                        />
                        <button
                          onClick={() => {
                            if (agent.retell_agent_id) {
                              navigator.clipboard.writeText(agent.retell_agent_id);
                              alert('Retell Agent ID copied to clipboard!');
                            }
                          }}
                          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your Retell AI agent identifier</p>
                    </div>
                  )}

                  {agent.retell_phone_number && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={agent.retell_phone_number}
                          readOnly
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 font-mono text-lg text-gray-900 font-bold"
                        />
                        <button
                          onClick={() => {
                            if (agent.retell_phone_number) {
                              navigator.clipboard.writeText(agent.retell_phone_number);
                              alert('Phone number copied to clipboard!');
                            }
                          }}
                          className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your active phone number for this agent</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Configuration */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Voice Model
                    </label>
                    <select
                      value={settingsVoice}
                      onChange={(e) => setSettingsVoice(e.target.value)}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900 bg-white"
                    >
                      <option value="11labs-Sarah" className="text-gray-900">🎙️ 11labs-Sarah (Female, Professional)</option>
                      <option value="11labs-Michael" className="text-gray-900">🎙️ 11labs-Michael (Male, Warm)</option>
                      <option value="11labs-Emma" className="text-gray-900">🎙️ 11labs-Emma (Female, Friendly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Agent Status
                    </label>
                    <select
                      value={settingsStatus}
                      onChange={(e) => setSettingsStatus(e.target.value)}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium capitalize text-gray-900 bg-white"
                    >
                      <option value="draft" className="text-gray-900">📝 Draft</option>
                      <option value="testing" className="text-gray-900">🧪 Testing</option>
                      <option value="active" className="text-gray-900">✅ Active</option>
                      <option value="paused" className="text-gray-900">⏸️ Paused</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={saveSettings}
                      disabled={isSavingSettings}
                      className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSettings ? '⏳ Saving...' : '💾 Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <WelcomeModal
          onStartTour={startTour}
          onSkip={skipTour}
        />
      )}

      {/* Interactive Tour Tooltip */}
      {isTourActive && currentStep && (
        <TourTooltip
          title={currentStep.title}
          description={currentStep.description}
          step={currentTourStep}
          totalSteps={tourSteps.length}
          position={currentStep.position}
          targetRef={currentStep.ref as any}
          onNext={nextTourStep}
          onPrev={prevTourStep}
          onClose={closeTour}
        />
      )}

      {/* Integration Modal */}
      {showIntegrationModal && selectedIntegration && (
        <IntegrationModal
          integrationType={selectedIntegration}
          onClose={() => {
            setShowIntegrationModal(false);
            setSelectedIntegration(null);
          }}
          onSave={async (credentials, settings) => {
            // TODO: Save to database via API
            console.log('Saving integration:', selectedIntegration, credentials, settings);

            // Add to active integrations
            setActiveIntegrations([
              ...activeIntegrations,
              {
                type: selectedIntegration,
                name: selectedIntegration === 'google-calendar' ? 'Google Calendar'
                     : selectedIntegration === 'calendly' ? 'Calendly'
                     : 'GoHighLevel',
                isActive: true
              }
            ]);

            setShowIntegrationModal(false);
            setSelectedIntegration(null);
          }}
        />
      )}

      {/* Knowledge Base Upload Modal */}
      {showKBModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">📚 Add Knowledge Base Item</h2>
              <button
                onClick={() => {
                  setShowKBModal(false);
                  setExtractedKBPreview(null);
                  setKbUrl('');
                  setKbFile(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all"
              >
                ✖️
              </button>
            </div>

            <div className="p-8">
              {!extractedKBPreview ? (
                <>
                  {/* Source Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      How would you like to add knowledge?
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setKbSourceType('file')}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          kbSourceType === 'file'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">📄</div>
                        <div className="font-bold text-gray-900">Upload File</div>
                        <div className="text-xs text-gray-500 mt-1">PDF, DOC, TXT</div>
                      </button>
                      <button
                        onClick={() => setKbSourceType('url')}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          kbSourceType === 'url'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">🌐</div>
                        <div className="font-bold text-gray-900">Website URL</div>
                        <div className="text-xs text-gray-500 mt-1">Extract from web</div>
                      </button>
                      <button
                        onClick={() => setKbSourceType('manual')}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          kbSourceType === 'manual'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">✍️</div>
                        <div className="font-bold text-gray-900">Manual Entry</div>
                        <div className="text-xs text-gray-500 mt-1">Type it yourself</div>
                      </button>
                    </div>
                  </div>

                  {/* File Upload */}
                  {kbSourceType === 'file' && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Upload Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => setKbFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="kb-file-upload"
                        />
                        <label htmlFor="kb-file-upload" className="cursor-pointer">
                          {kbFile ? (
                            <div>
                              <div className="text-4xl mb-2">📄</div>
                              <div className="font-bold text-gray-900">{kbFile.name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {(kbFile.size / 1024).toFixed(0)} KB
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-4xl mb-2">📤</div>
                              <div className="font-bold text-gray-900 mb-1">Click to upload</div>
                              <div className="text-sm text-gray-500">PDF, DOC, DOCX, or TXT</div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* URL Input */}
                  {kbSourceType === 'url' && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={kbUrl}
                        onChange={(e) => setKbUrl(e.target.value)}
                        placeholder="https://example.com/about"
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        We'll extract the main content from this page and create a knowledge base item
                      </p>
                    </div>
                  )}

                  {/* Manual Entry */}
                  {kbSourceType === 'manual' && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Knowledge Base Content
                      </label>
                      <textarea
                        value={extractedKBPreview?.content || ''}
                        onChange={(e) => setExtractedKBPreview({ name: 'CUSTOM', content: e.target.value })}
                        placeholder="Enter information your agent should know..."
                        rows={12}
                        className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-gray-900"
                      />
                    </div>
                  )}

                  {/* Extract Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={extractKBFromSource}
                      disabled={isExtractingKB || (kbSourceType === 'file' && !kbFile) || (kbSourceType === 'url' && !kbUrl)}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isExtractingKB ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Extracting...
                        </span>
                      ) : (
                        `🔍 ${kbSourceType === 'manual' ? 'Preview' : 'Extract Content'}`
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview Extracted KB */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Knowledge Base Name
                    </label>
                    <input
                      type="text"
                      value={extractedKBPreview.name}
                      onChange={(e) => setExtractedKBPreview({ ...extractedKBPreview, name: e.target.value })}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Content (Edit as needed)
                    </label>
                    <textarea
                      value={extractedKBPreview.content}
                      onChange={(e) => setExtractedKBPreview({ ...extractedKBPreview, content: e.target.value })}
                      rows={15}
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-gray-900"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setExtractedKBPreview(null)}
                      className="px-8 py-4 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={saveKBItem}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg shadow-green-600/30 transition-all"
                    >
                      ✅ Add to Knowledge Base
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voice Cloning Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">🎤 Clone Your Voice</h2>
              <button
                onClick={() => setShowCloneModal(false)}
                className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all"
              >
                ✖️
              </button>
            </div>

            <div className="p-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  How to get the best results:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Record in a quiet environment with minimal background noise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Speak naturally and clearly for at least 30 seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Use WAV or MP3 format, under 10MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Express a range of emotions for more versatility</span>
                  </li>
                </ul>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  setIsCloning(true);

                  try {
                    const response = await fetch('/api/voices/clone', {
                      method: 'POST',
                      body: formData
                    });

                    const data = await response.json();
                    if (data.success) {
                      alert('Voice cloned successfully! It will appear in your library shortly.');
                      setShowCloneModal(false);
                      loadVoices(); // Refresh voice list
                    } else {
                      alert('Failed to clone voice: ' + (data.error || 'Unknown error'));
                    }
                  } catch (error) {
                    console.error('Error cloning voice:', error);
                    alert('Failed to clone voice');
                  } finally {
                    setIsCloning(false);
                  }
                }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Voice Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., My Custom Voice"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Audio Sample
                    </label>
                    <input
                      type="hidden"
                      name="organization_id"
                      value={agent?.id || agentId}
                    />
                    <input
                      type="file"
                      name="audio"
                      required
                      accept=".wav,.mp3,.m4a"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: WAV, MP3, M4A (max 10MB)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isCloning}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCloning ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Cloning Voice...
                        </span>
                      ) : (
                        '🎤 Clone Voice'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCloneModal(false)}
                      className="px-6 py-4 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* KB Edit Modal */}
      {showKBEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">✏️ Edit Knowledge Base Item</h2>
              <button
                onClick={() => {
                  setShowKBEditModal(false);
                  setEditingKBIndex(null);
                  setEditingKBName('');
                  setEditingKBContent('');
                }}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={editingKBName}
                    onChange={(e) => setEditingKBName(e.target.value)}
                    placeholder="e.g., Pricing Information"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Will be formatted as: KB_{editingKBName.trim().replace(/\s+/g, '_').toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editingKBContent}
                    onChange={(e) => setEditingKBContent(e.target.value)}
                    placeholder="Enter the information here..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium h-64"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveKBEdit}
                    disabled={!editingKBName.trim() || !editingKBContent.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowKBEditModal(false);
                      setEditingKBIndex(null);
                      setEditingKBName('');
                      setEditingKBContent('');
                    }}
                    className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {showCallDetailsModal && selectedCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-t-3xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Call Details</h3>
                <p className="text-blue-100 text-sm mt-1">
                  {new Date(selectedCall.started_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCallDetailsModal(false);
                  setSelectedCall(null);
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Call Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 font-semibold mb-1">From Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCall.from_number || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 font-semibold mb-1">To Number</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCall.to_number || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCall.duration_ms ? `${Math.ceil(selectedCall.duration_ms / 60000)}m ${Math.floor((selectedCall.duration_ms % 60000) / 1000)}s` : 'In Progress'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                    selectedCall.call_status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedCall.call_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedCall.call_status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Recording */}
              {selectedCall.recording_url && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🎧</span> Call Recording
                  </h4>
                  <audio controls className="w-full">
                    <source src={selectedCall.recording_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.transcript && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📝</span> Transcript
                  </h4>
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedCall.transcript}</p>
                  </div>
                </div>
              )}

              {/* Interactive Transcript with Training Feedback */}
              {selectedCall.transcript_object && Array.isArray(selectedCall.transcript_object) && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💬</span> Transcript
                    <span className="ml-auto text-xs font-normal text-gray-600 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                      🎯 Training Mode Active
                    </span>
                  </h4>

                  {/* Scrollable Transcript Area */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col" style={{ height: '500px' }}>
                    {/* Messages - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                      {selectedCall.transcript_object.map((turn: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-lg ${
                          turn.role === 'agent' ? 'bg-blue-100 ml-8' : 'bg-gray-200 mr-8'
                        }`}>
                          <p className="text-xs font-bold text-gray-600 mb-1 uppercase">
                            {turn.role === 'agent' ? '🤖 Agent' : '👤 User'}
                          </p>
                          <p className="text-gray-900">{turn.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Sticky Feedback Input - Always at bottom */}
                    <div className="flex-shrink-0 border-t-2 border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={callFeedback}
                          onChange={(e) => setCallFeedback(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && submitCallFeedback()}
                          placeholder="Found an issue? Tell the AI how to improve (e.g., 'Be more empathetic when handling objections')"
                          className="flex-1 px-4 py-3 border-2 border-yellow-300 bg-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-medium text-sm"
                          disabled={isProcessingCallFeedback}
                        />
                        <button
                          onClick={submitCallFeedback}
                          disabled={!callFeedback.trim() || isProcessingCallFeedback}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 font-semibold shadow-lg shadow-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                          {isProcessingCallFeedback ? '⏳ Training...' : '🎯 Improve'}
                        </button>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2 font-medium">
                        💡 Scroll through the transcript and add feedback to train your AI based on this call
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Analysis */}
              {selectedCall.call_analysis && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📊</span> Call Analysis
                  </h4>
                  <pre className="bg-white rounded-lg p-4 text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedCall.call_analysis, null, 2)}
                  </pre>
                </div>
              )}

              {/* No Data Message */}
              {!selectedCall.transcript && !selectedCall.transcript_object && !selectedCall.recording_url && !selectedCall.call_analysis && selectedCall.call_status === 'in_progress' && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                  <p className="text-lg font-semibold text-yellow-800 mb-2">⏳ Call in Progress</p>
                  <p className="text-sm text-yellow-700">
                    This call is still active. Details will be available after the call ends.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
