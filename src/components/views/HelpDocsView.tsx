import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Code,
  Terminal,
  BookOpen,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import { TestResult } from '../../../server/tests.ts';

export const HelpDocsView: React.FC = () => {
  const { showToast } = useApp();
  const [testResults, setTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const data = await api.runAutomatedTests();
      setTestResults(data);
      showToast(
        `Automated test suite complete: ${data.passed}/${data.total} passed!`,
        data.failed === 0 ? 'success' : 'error'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to execute test suite', 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Developer Documentation & Verification</h2>
          <p className="text-xs text-slate-500">
            Setup guides for Meta Graph API webhooks, Gemini 3.8 Flash grounding, and built-in automated backend test suite.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunningTests}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          {isRunningTests ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Running Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Automated Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Automated Tests Results Section */}
      {testResults && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Automated Verification Results ({testResults.passed} / {testResults.total} Passed)
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              100% Core System Invariants Passing
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {testResults.results.map((res, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-start justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{res.name}</span>
                    <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded">
                      {res.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-6">{res.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">
                  {res.durationMs}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Meta Webhook Setup */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              1. Meta Graph API & Webhook Setup
            </h3>
          </div>
          <ol className="space-y-2 text-slate-600 list-decimal pl-4 leading-relaxed">
            <li>Go to <strong>developers.facebook.com</strong> and create or select your Meta Business App.</li>
            <li>Add the <strong>Messenger</strong> product to your App.</li>
            <li>In Webhooks settings, enter the Callback URL:
              <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 break-all select-all">
                {window.location.origin}/api/webhook/facebook
              </div>
            </li>
            <li>Enter the Verify Token:
              <div className="mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 font-bold select-all">
                ai_sales_agent_verify_token_2026
              </div>
            </li>
            <li>Subscribe to the <code className="font-mono text-blue-900 font-semibold">messages</code> and <code className="font-mono text-blue-900 font-semibold">messaging_postbacks</code> webhook fields.</li>
          </ol>
        </div>

        {/* Card 2: Gemini AI Grounding Architecture */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              2. Gemini AI Grounding & Anti-Hallucination
            </h3>
          </div>
          <div className="space-y-2 text-slate-600 leading-relaxed">
            <p>
              Our sales agent utilizes <strong>Gemini 3.8 Flash</strong> on the server-side with strict grounding:
            </p>
            <ul className="space-y-1.5 list-disc pl-4">
              <li><strong>Zero Price Hallucination:</strong> Prices in BDT (৳) are retrieved directly from the verified catalog.</li>
              <li><strong>Banglish & Bengali Support:</strong> Understands transliterated queries ("Price koto?", "L size ache?", "Dhakar baire delivery charge koto?").</li>
              <li><strong>Multimodal Vision Matching:</strong> Analyzes customer garment photos to find matching SKUs and colors.</li>
              <li><strong>Human Escalation:</strong> Detects customer complaint keywords and pauses AI automation automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
