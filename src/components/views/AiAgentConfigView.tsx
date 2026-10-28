import React, { useState, useEffect } from 'react';
import {
  Bot,
  Save,
  Sliders,
  Clock,
  Shield,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { AiAgentConfig } from '../../types/index.ts';

export const AiAgentConfigView: React.FC = () => {
  const { showToast, language } = useApp();
  const [config, setConfig] = useState<AiAgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await api.getAiConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load AI config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    try {
      await api.saveAiConfig(config);
      showToast('AI Sales Agent configuration successfully saved and updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading AI Agent settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
            <Bot className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Sales Agent Settings & Persona</h2>
            <p className="text-xs text-slate-500">
              Configure how Gemini communicates with customers on Facebook Messenger in Bangla and English.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableAutomation}
              onChange={(e) => setConfig({ ...config, enableAutomation: e.target.checked })}
              className="w-4 h-4 text-blue-900 rounded focus:ring-blue-600 border-slate-300"
            />
            <span>Automation Active</span>
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identity & Persona */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-900" />
            <span>Agent Identity & Tone</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Agent Name</label>
            <input
              type="text"
              value={config.agentName}
              onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Business / Brand Name</label>
            <input
              type="text"
              value={config.businessName}
              onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Language Preference</label>
            <select
              value={config.preferredLanguage}
              onChange={(e) => setConfig({ ...config, preferredLanguage: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="auto">Auto-detect (Bangla, Banglish, English)</option>
              <option value="bn">Always reply in Bengali (বাংলা)</option>
              <option value="en">Always reply in English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Communication Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {(['friendly', 'formal', 'concise'] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setConfig({ ...config, communicationTone: tone })}
                  className={`py-2 text-xs font-medium rounded-lg capitalize border text-center transition-colors ${
                    config.communicationTone === tone
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Persona Description</label>
            <textarea
              rows={3}
              value={config.personality}
              onChange={(e) => setConfig({ ...config, personality: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Card 2: Operating Hours & Handoff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-900" />
            <span>Operating Hours & Human Escalation</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Hours Start</label>
              <input
                type="time"
                value={config.businessHoursStart}
                onChange={(e) => setConfig({ ...config, businessHoursStart: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Hours End</label>
              <input
                type="time"
                value={config.businessHoursEnd}
                onChange={(e) => setConfig({ ...config, businessHoursEnd: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Out-of-Hours Auto-Message</label>
            <textarea
              rows={2}
              value={config.outOfHoursMessage}
              onChange={(e) => setConfig({ ...config, outOfHoursMessage: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Human Handoff Keywords (Comma Separated)
            </label>
            <input
              type="text"
              value={config.humanHandoffTriggers.join(', ')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  humanHandoffTriggers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g. human, agent, complain, refund, exchange, manush"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              When a customer types any of these words, AI halts immediately and assigns the chat to a human moderator.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 mb-1">
              <span className="font-medium">Confidence Threshold</span>
              <span className="font-mono font-bold text-blue-900">{Math.round(config.confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={config.confidenceThreshold}
              onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
              className="w-full accent-blue-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Anti-Hallucination & Policy Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-900" />
          <span>Strict Guardrails & Prohibited Claims</span>
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Custom System Instructions</label>
          <textarea
            rows={3}
            value={config.customInstructions}
            onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Prohibited Claims (Claims the AI must NEVER make)
          </label>
          <div className="space-y-1.5">
            {config.prohibitedClaims.map((claim, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="flex-1">{claim}</span>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      prohibitedClaims: config.prohibitedClaims.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-slate-400 hover:text-rose-600 text-[11px]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
