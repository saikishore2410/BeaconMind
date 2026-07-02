import { useState } from "react";
import { 
  FileText, 
  Trash2, 
  Download, 
  Wind, 
  Fingerprint, 
  Compass, 
  Smile, 
  Frown, 
  ArrowRight,
  Clipboard,
  Check,
  Calendar,
  Layers
} from "lucide-react";
import { GroundingLogEntry, SavedSearchPlan } from "../types";

interface CareReportsProps {
  groundingLogs: GroundingLogEntry[];
  savedPlans: SavedSearchPlan[];
  onClearGroundingLogs: () => void;
  onClearSavedPlans: () => void;
  onDeleteGroundingLog: (id: string) => void;
  onDeleteSavedPlan: (id: string) => void;
}

export default function CareReports({
  groundingLogs,
  savedPlans,
  onClearGroundingLogs,
  onClearSavedPlans,
  onDeleteGroundingLog,
  onDeleteSavedPlan
}: CareReportsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Generate plain-text consolidated report
  const generateConsolidatedReport = (): string => {
    let report = `==================================================\n`;
    report += `          BEACONMIND PERSONAL CARE REPORT          \n`;
    report += `        Generated on: ${new Date().toLocaleString()}       \n`;
    report += `==================================================\n\n`;

    report += `Disclaimer: This document is a clinical preparation aid and symptom log.\n`;
    report += `It does not constitute formal diagnosis, medical advice, or psychiatric treatment.\n\n`;

    report += `--------------------------------------------------\n`;
    report += `I. SOMATIC GROUNDING SUMMARY & PRACTICE HISTORY\n`;
    report += `--------------------------------------------------\n`;
    if (groundingLogs.length === 0) {
      report += `No grounding exercises logged yet.\n\n`;
    } else {
      report += `Total Sessions Logged: ${groundingLogs.length}\n\n`;
      groundingLogs.forEach((log, index) => {
        report += `Session #${index + 1} (${log.timestamp})\n`;
        report += `- Type: ${log.type === "breathing" ? `Breathing Regulation (${log.patternLabel})` : "5-4-3-2-1 Sensory Grounding"}\n`;
        report += `- Distress Level: Before ${log.preStress}/10 -> After ${log.postStress}/10 (Diff: ${log.preStress - log.postStress})\n`;
        if (log.sensoryInputs) {
          report += `  * Things Seen: ${log.sensoryInputs.see.join(", ") || "None recorded"}\n`;
          report += `  * Things Felt: ${log.sensoryInputs.touch.join(", ") || "None recorded"}\n`;
          report += `  * Sounds Heard: ${log.sensoryInputs.hear.join(", ") || "None recorded"}\n`;
          report += `  * Scents Smelled: ${log.sensoryInputs.smell.join(", ") || "None recorded"}\n`;
          report += `  * Flavour Tasted: ${log.sensoryInputs.taste || "None recorded"}\n`;
        }
        report += `\n`;
      });
    }

    report += `--------------------------------------------------\n`;
    report += `II. SAVED THERAPIST SEARCH & REFERRAL PLANS\n`;
    report += `--------------------------------------------------\n`;
    if (savedPlans.length === 0) {
      report += `No therapist search plans saved yet.\n\n`;
    } else {
      savedPlans.forEach((saved, index) => {
        report += `Plan #${index + 1} (${saved.timestamp})\n`;
        report += `- Current Heavy Feeling: ${saved.feeling}\n`;
        report += `- Desired Location: ${saved.location}\n`;
        report += `- Suggested Search Keywords: ${saved.plan.suggestedDirectoryKeywords.join(", ") || "None"}\n`;
        report += `- Simple Action Steps:\n`;
        saved.plan.actionPlan.forEach((step, stepIdx) => {
          report += `  ${stepIdx + 1}. ${step}\n`;
        });
        report += `- Core Consult Questions to Ask:\n`;
        saved.plan.keyQuestions.forEach((q) => {
          report += `  * ${q}\n`;
        });
        report += `- Custom Outbound Email Draft:\n`;
        report += `"""\n${saved.plan.emailTemplate}\n"""\n`;
        report += `\n--------------------------------------------------\n\n`;
      });
    }

    report += `==================================================\n`;
    report += `BeaconMind - Supporting clear paths to professional care.\n`;
    report += `==================================================\n`;

    return report;
  };

  const downloadReportFile = () => {
    const reportText = generateConsolidatedReport();
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beaconmind_care_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSymptomReductionAverage = () => {
    if (groundingLogs.length === 0) return 0;
    const totalReduction = groundingLogs.reduce((acc, log) => acc + (log.preStress - log.postStress), 0);
    return Number((totalReduction / groundingLogs.length).toFixed(1));
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sage-100 shadow-sm max-w-4xl mx-auto" id="care-reports-root">
      
      {/* Tab Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-50 text-sage-850 border border-sage-100 mb-2">
            <FileText className="w-3.5 h-3.5 text-sage-600" />
            Fieldwork & Self-Care Logs
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-sage-800">
            Care Logs & Exporter
          </h2>
          <p className="text-xs text-sage-600 mt-1">
            Track your stress regulation history, save customized search plans, and download structured consultation packets to bring to your therapist or caseworker.
          </p>
        </div>

        {/* Global Export Button */}
        {(groundingLogs.length > 0 || savedPlans.length > 0) && (
          <button
            onClick={downloadReportFile}
            className="px-4.5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-sage-200"
            id="download-full-report-btn"
          >
            <Download className="w-4 h-4" /> Export Referral Package (.TXT)
          </button>
        )}
      </div>

      {/* Analytics Summary */}
      {groundingLogs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4" id="reports-analytics-cards">
          <div className="bg-sage-50/40 rounded-xl p-4 border border-sage-100/50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wide">
              Logged Somatic Practices
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-sage-800 font-display">
                {groundingLogs.length}
              </span>
              <span className="text-xs text-gray-500">sessions</span>
            </div>
          </div>

          <div className="bg-sage-50/40 rounded-xl p-4 border border-sage-100/50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wide">
              Average Stress Reduction
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-sage-800 font-display">
                -{getSymptomReductionAverage()}
              </span>
              <span className="text-xs text-gray-500">levels/session</span>
            </div>
          </div>

          <div className="bg-sage-50/40 rounded-xl p-4 border border-sage-100/50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wide">
              Saved Search Plans
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-sage-800 font-display">
                {savedPlans.length}
              </span>
              <span className="text-xs text-gray-500">plans ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Logs Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Somatic Grounding Practice Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sage-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sage-600" />
              Somatic Grounding Logs ({groundingLogs.length})
            </h3>
            {groundingLogs.length > 0 && (
              <button
                onClick={onClearGroundingLogs}
                className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                id="clear-all-grounding-btn"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>

          {groundingLogs.length === 0 ? (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
              <Wind className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p>No grounding sessions logged yet.</p>
              <p className="mt-1 text-[11px] text-gray-450">Complete a breathing or sensory exercise to track your progress.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" id="grounding-logs-list">
              {groundingLogs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-150 rounded-xl p-4 flex flex-col justify-between relative hover:border-sage-200 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {log.type === "breathing" ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-sage-100 text-sage-800 uppercase tracking-wide flex items-center gap-0.5">
                            <Wind className="w-2.5 h-2.5" /> Breath Regulation
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide flex items-center gap-0.5">
                            <Fingerprint className="w-2.5 h-2.5" /> Sensory 5-4-3-2-1
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {log.timestamp}
                        </span>
                      </div>
                      
                      {log.patternLabel && (
                        <h4 className="text-xs font-semibold text-gray-800 mt-1">{log.patternLabel}</h4>
                      )}

                      {log.sensoryInputs && (
                        <div className="mt-2 text-[10px] text-gray-500 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                          <p><strong>See:</strong> {log.sensoryInputs.see.join(", ")}</p>
                          <p><strong>Touch:</strong> {log.sensoryInputs.touch.join(", ")}</p>
                          <p><strong>Hear:</strong> {log.sensoryInputs.hear.join(", ")}</p>
                          <p><strong>Smell:</strong> {log.sensoryInputs.smell.join(", ")}</p>
                          <p><strong>Taste:</strong> {log.sensoryInputs.taste}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium text-gray-500">Distress Level:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono font-bold text-red-600">{log.preStress}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-mono font-bold text-sage-700">{log.postStress}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-sage-50 text-sage-750 px-1.5 py-0.5 rounded-md">
                          -{log.preStress - log.postStress} Distress
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGroundingLog(log.id)}
                      className="text-gray-350 hover:text-red-700 p-1 rounded-md transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Saved Therapist Search Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sage-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sage-600" />
              Saved Search Plans ({savedPlans.length})
            </h3>
            {savedPlans.length > 0 && (
              <button
                onClick={onClearSavedPlans}
                className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                id="clear-all-plans-btn"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>

          {savedPlans.length === 0 ? (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
              <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p>No therapist search plans saved yet.</p>
              <p className="mt-1 text-[11px] text-gray-450">Use our Search Planner to construct a tailored roadmap to professional care.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" id="saved-plans-list">
              {savedPlans.map((item) => (
                <div key={item.id} className="bg-white border border-gray-150 rounded-xl p-4 flex flex-col justify-between hover:border-sage-200 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-sage-100 text-sage-800 uppercase tracking-wide flex items-center gap-0.5">
                          <Compass className="w-2.5 h-2.5" /> Referral Prep
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {item.timestamp}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Heavy Feeling focus:</span>
                        <p className="text-xs font-semibold text-gray-800">{item.feeling}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Target Region:</span>
                        <p className="text-xs text-gray-600">{item.location}</p>
                      </div>

                      {/* Micro actions preview */}
                      <div className="bg-sage-50/30 p-2.5 rounded-lg border border-sage-50 text-[11px] text-sage-800 leading-relaxed space-y-1">
                        <p className="font-bold">Roadmap Steps:</p>
                        {item.plan.actionPlan.slice(0, 2).map((st, sidx) => (
                          <p key={sidx} className="flex gap-1">
                            <span>{sidx + 1}.</span> <span>{st}</span>
                          </p>
                        ))}
                        {item.plan.actionPlan.length > 2 && (
                          <p className="text-[9px] text-gray-450 italic">+ {item.plan.actionPlan.length - 2} more step</p>
                        )}
                      </div>

                      {/* Expose Email Copy Trigger */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(item.plan.emailTemplate, item.id)}
                          className="px-3 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-150 text-sage-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-sage-600" /> Copied Email!
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3" /> Copy Email Template
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    <button
                      onClick={() => onDeleteSavedPlan(item.id)}
                      className="text-gray-350 hover:text-red-700 p-1 rounded-md transition-all cursor-pointer shrink-0"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
