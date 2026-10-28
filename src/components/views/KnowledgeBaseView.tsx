import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, Search, FileText, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { KnowledgeDocument } from '../../types/index.ts';

export const KnowledgeBaseView: React.FC = () => {
  const { showToast, refreshKey, triggerRefresh } = useApp();
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeDocument['category']>('faq');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const list = await api.getKnowledgeDocs();
        setDocs(list);
      } catch (err) {
        console.error('Failed to load docs:', err);
      }
    };
    loadDocs();
  }, [refreshKey]);

  const handleDelete = async (id: string, docTitle: string) => {
    if (confirm(`Delete document "${docTitle}"?`)) {
      try {
        await api.deleteKnowledgeDoc(id);
        showToast('Knowledge document deleted', 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete doc', 'error');
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.createKnowledgeDoc({
        title: title.trim(),
        category,
        content: content.trim(),
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      showToast(`Created knowledge document: ${title}`, 'success');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setKeywords('');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create doc', 'error');
    }
  };

  const filtered = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Knowledge Base & Approved Policies</h2>
          <p className="text-xs text-slate-500">
            Ground truth documents for the AI Sales Agent. The AI will strictly cite and abide by these policies.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Knowledge Doc</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search policies, delivery rules, return guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-900">{doc.title}</h3>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-900 px-2 py-0.5 rounded capitalize">
                    {doc.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => handleDelete(doc.id, doc.title)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
              {doc.content}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-medium text-slate-400">RAG Trigger Keywords:</span>
              {doc.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Add Knowledge Document</h3>
            <p className="text-slate-500 mb-4">
              Ground your AI sales agent with authoritative business facts, delivery charges, or exchange rules.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day Exchange Policy & Procedure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="policy">Store Policy</option>
                  <option value="faq">FAQ</option>
                  <option value="product_guide">Product Sizing Guide</option>
                  <option value="company_info">Company & Contact Info</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Exact policy wording the AI should adhere to..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Trigger Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. return, exchange, choto, boro, size problem"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
