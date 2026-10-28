import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, ShieldCheck, CheckCircle2, AlertTriangle, Send, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';

export const CommentsAutomationView: React.FC = () => {
  const { showToast } = useApp();
  const [data, setData] = useState<any>(null);
  const [testComment, setTestComment] = useState('Price koto hobe? Size 42 ache?');
  const [testOutput, setTestOutput] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getCommentsAutomation();
        setData(res);
      } catch (err) {
        console.error('Failed to load comments automation:', err);
      }
    };
    load();
  }, []);

  const handleTestComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testComment.trim()) return;

    setTestOutput({
      matchedRule: 'Auto-reply to "Price koto?" on Facebook Page Posts',
      publicReply: 'Assalamu Alaikum! Inbox check korun please! Details and offer price pathano hoyeche.',
      privateDmSent: 'Our Royal Heritage Semi-Fitted Silk Panjabi is currently on sale for ৳2,350 (Regular ৳2,650). Available in size 42. Would you like to confirm?',
      policyCompliant: true,
    });
    showToast('Simulated compliant comment-to-DM response', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Facebook Page Comments Automation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automate public replies on your Facebook post comments and send 1:1 Messenger inbox messages under official Meta policies.
        </p>

        {/* Compliance Notice */}
        <div className="mt-4 bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-blue-950">Meta Platform Compliance Standard</div>
            <p className="text-blue-900 leading-relaxed text-[11px]">
              {data?.complianceNote ||
                'Meta Graph API Policy: Public post comments can trigger 1 public reply + 1 private Messenger DM only if the customer leaves a top-level post comment within 7 days. Once the user replies to the private message, the full 24-hour conversational sales window opens.'}
            </p>
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Post Comment Rules
        </h3>

        {(data?.rules || []).map((rule: any) => (
          <div key={rule.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-xs text-slate-900">{rule.name}</h4>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                  1. Public Comment Reply
                </span>
                <p className="text-slate-800 italic">"{rule.publicReply}"</p>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-800 font-semibold uppercase block mb-1">
                  2. Private Messenger DM Trigger
                </span>
                <p className="text-blue-950 font-medium">{rule.privateDmAction}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Keywords: <code className="text-slate-700 font-mono">{rule.keyword}</code></span>
              <span>
                Processed: <strong className="text-slate-700">{rule.stats.commentsProcessed}</strong> · Private DMs sent: <strong className="text-blue-900">{rule.stats.privateDmsSent}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Simulator for Comment Automation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Test Comment-to-Inbox Automation
          </h3>
        </div>

        <form onSubmit={handleTestComment} className="flex gap-2 text-xs">
          <input
            type="text"
            value={testComment}
            onChange={(e) => setTestComment(e.target.value)}
            placeholder="Type a sample customer comment (e.g. Price koto?)..."
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
          >
            Test Reply
          </button>
        </form>

        {testOutput && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="text-emerald-700 font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched Rule: {testOutput.matchedRule}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Public Reply Posted:</span>
                <p className="mt-1 text-slate-800">{testOutput.publicReply}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-blue-800 font-bold uppercase block">Private DM Initiated:</span>
                <p className="mt-1 text-blue-950 font-medium">{testOutput.privateDmSent}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
