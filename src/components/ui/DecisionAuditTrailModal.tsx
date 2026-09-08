// Demonstration Decision Log & Audit Trail for TN NEXUS
import React from 'react';
import { FileText, X, Download, Clock, MapPin, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const DecisionAuditTrailModal: React.FC = () => {
  const isAuditModalOpen = useCityStore((state) => state.isAuditModalOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const decisionAuditLog = useCityStore((state) => state.decisionAuditLog);

  if (!isAuditModalOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decisionAuditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tn_nexus_decision_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl nexus-glass rounded-2xl border border-white/10 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isAuditModalOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
          <FileText className="w-4 h-4" />
          <span>STATUTORY DECISION AUDIT TRAIL</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Demonstration Decision Log
            </h3>
            <p className="text-xs text-slate-400">
              Immutable chronological record of infrastructure proposals, spatial coordinates, necessity scores, and approval actions.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold hover:bg-cyan-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* Log Entries List */}
        <div className="space-y-3 mb-6 font-mono text-xs">
          {decisionAuditLog.map((log) => {
            const isApprove = log.action === 'APPROVE';
            const isReject = log.action === 'REJECT';
            const isOptimize = log.action === 'OPTIMIZE';

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isApprove && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isReject && <XCircle className="w-4 h-4 text-rose-400" />}
                    {isOptimize && <Sparkles className="w-4 h-4 text-purple-400" />}
                    {!isApprove && !isReject && !isOptimize && <Clock className="w-4 h-4 text-cyan-400" />}
                    <span className="font-bold text-white">{log.assetName}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isApprove
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isReject
                        ? 'bg-rose-500/20 text-rose-300'
                        : isOptimize
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    ACTION: {log.action}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Timestamp: {log.timestamp}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> [{log.location[0]}, {log.location[2]}]
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">
                    Score: {log.necessityScore}/100 ({log.verdict})
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 pt-1 border-t border-white/5 font-sans leading-relaxed">
                  {log.userNotes}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>Demonstration decision audit ready for municipal archiving.</span>
          <button
            onClick={() => setModalState('isAuditModalOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
