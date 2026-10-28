import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Shield, User, Clock, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { WorkspaceMember, AuditLog, Role } from '../../types/index.ts';

export const TeamView: React.FC = () => {
  const { currentWorkspace, showToast, refreshKey, triggerRefresh } = useApp();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Moderator');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mList, logs] = await Promise.all([api.getMembers(), api.getAuditLogs()]);
        setMembers(mList);
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load team data:', err);
      }
    };
    loadData();
  }, [refreshKey]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await api.inviteMember(inviteEmail.trim(), inviteName.trim(), inviteRole);
      showToast(`Invited ${inviteEmail} as ${inviteRole}`, 'success');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to invite', 'error');
    }
  };

  const handleRoleChange = async (id: string, newRole: Role) => {
    try {
      await api.updateMemberRole(id, newRole);
      showToast('Updated member role', 'info');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from this store workspace?`)) {
      try {
        await api.removeMember(id);
        showToast(`Removed ${name}`, 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to remove', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Team Members & Access Control</h2>
          <p className="text-xs text-slate-500">
            Manage who can view products, respond to customer messages, confirm orders, or manage AI settings.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase">
            <tr>
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                    {m.userName[0]}
                  </div>
                  <span>{m.userName}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{m.userEmail}</td>
                <td className="py-3 px-4">
                  {m.role === 'Owner' ? (
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                      Owner
                    </span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as Role)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded bg-white font-medium focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">
                  {new Date(m.joinedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {m.role !== 'Owner' && (
                    <button
                      onClick={() => handleRemove(m.id, m.userName)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Logs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Workspace Administrative Audit Logs
          </h3>
        </div>

        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-900">{log.userName}</span>
                <span className="text-slate-500 mx-1.5">·</span>
                <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                  {log.action}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Invite Workspace Member</h3>
            <p className="text-slate-500 mb-4">
              Add a team member to {currentWorkspace?.name}.
            </p>

            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Farhana Yasmin"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@auratrends.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Admin">Admin (Full store access except billing)</option>
                  <option value="Moderator">Moderator (Inbox, human takeover, order updates)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
