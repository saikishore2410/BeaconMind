import { useState } from "react";
import { Compass, Copy, Check, Loader2, Sparkles, ArrowRight, ArrowLeft, Mail, Filter, HelpCircle, FileText, Save } from "lucide-react";
import { SearchPlan } from "../types";

interface TherapistSearchHelperProps {
  onSavePlan?: (plan: SearchPlan, feeling: string, location: string) => void;
}

export default function TherapistSearchHelper({ onSavePlan }: TherapistSearchHelperProps) {
  const [step, setStep] = useState<number>(1);
  const [feeling, setFeeling] = useState<string>("");
  const [mode, setMode] = useState<string>("");
  const [insurance, setInsurance] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [preferences, setPreferences] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plan, setPlan] = useState<SearchPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlan, setSavedPlan] = useState<boolean>(false);


  const FEELING_OPTIONS = [
    { value: "anxious", label: "Anxiety & Racing Thoughts" },
    { value: "depressed", label: "Deep Sadness & Low Motivation" },
    { value: "burnt-out", label: "Work & Academic Burnout" },
    { value: "grief", label: "Loss & Active Grief" },
    { value: "relationship", label: "Relationship or Family Stress" },
    { value: "crisis-overwhelmed", label: "General Feeling of Overwhelm" }
  ];

  const MODE_OPTIONS = [
    { value: "telehealth", label: "Remote Telehealth (Convenient & Comfortable)" },
    { value: "in-person", label: "In-Person Sessions (Stronger Presence)" },
    { value: "any", label: "No Preference / Open to Either" }
  ];

  const INSURANCE_OPTIONS = [
    { value: "out-of-pocket", label: "Self-Pay / Sliding Scale (Income-based discount)" },
    { value: "student", label: "Student Health Insurance" },
    { value: "commercial", label: "Commercial Insurance (Aetna, BCBS, Cigna, etc.)" },
    { value: "government", label: "Medicare / Medicaid" },
    { value: "unknown", label: "Unsure / I need help figuring this out" }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/simplify-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeling,
          mode,
          insurance,
          location,
          preferences
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to formulate search plan");
      }

      const data = await response.json();
      setPlan(data);
      setStep(5); // Show results step
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmailTemplate = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan.emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setStep(1);
    setFeeling("");
    setMode("");
    setInsurance("");
    setLocation("");
    setPreferences("");
    setPlan(null);
    setError(null);
    setSavedPlan(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sage-100 shadow-sm max-w-3xl mx-auto" id="search-helper-card">
      {/* Header section (only hide on final output page to maximize space) */}
      {step < 5 && (
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-50 text-sage-800 border border-sage-100 mb-3">
            <Compass className="w-3.5 h-3.5 text-sage-500" />
            Therapist Match Navigator
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-sage-800" id="search-helper-title">
            Simplify My Search
          </h2>
          <p className="text-sm text-sage-600 mt-2">
            Searching for therapy shouldn't trigger more stress. Answer 4 quick items and we'll draft a clear email, filters, and step-by-step plan.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {step < 5 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8" id="progress-bar-container">
          <div
            className="bg-sage-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
            id="progress-bar-fill"
          />
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100" id="search-error-alert">
          {error}
        </div>
      )}

      {/* STEP 1: Emotion Selection */}
      {step === 1 && (
        <div className="space-y-4" id="search-step-1">
          <h3 className="text-lg font-medium text-gray-800 font-display">
            1. What has been feeling heaviest lately?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEELING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFeeling(opt.label)}
                className={`p-4 text-left rounded-xl border transition-all ${
                  feeling === opt.label
                    ? "border-sage-500 bg-sage-50/70 text-sage-850 font-medium"
                    : "border-gray-100 hover:border-sage-200 bg-white text-gray-600"
                }`}
                id={`feeling-opt-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-sage-500 uppercase tracking-wider block mb-2">
              Or, type a brief description in your own words:
            </label>
            <input
              type="text"
              placeholder="e.g., Struggling with transitions and finding balance after changing jobs."
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-sage-300 focus:outline-none bg-white text-sm"
              id="feeling-custom-input"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={!feeling.trim()}
              className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
              id="feeling-next-btn"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Mode of Care */}
      {step === 2 && (
        <div className="space-y-4" id="search-step-2">
          <h3 className="text-lg font-medium text-gray-800 font-display">
            2. How would you prefer to meet with a therapist?
          </h3>
          <div className="space-y-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.label)}
                className={`w-full p-4 text-left rounded-xl border transition-all ${
                  mode === opt.label
                    ? "border-sage-500 bg-sage-50/70 text-sage-850 font-medium"
                    : "border-gray-100 hover:border-sage-200 bg-white text-gray-600"
                }`}
                id={`mode-opt-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-medium border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-all"
              id="mode-back-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!mode}
              className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
              id="mode-next-btn"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Insurance Coverage */}
      {step === 3 && (
        <div className="space-y-4" id="search-step-3">
          <h3 className="text-lg font-medium text-gray-800 font-display">
            3. What is your budget or insurance preference?
          </h3>
          <div className="space-y-2">
            {INSURANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInsurance(opt.label)}
                className={`w-full p-4 text-left rounded-xl border transition-all ${
                  insurance === opt.label
                    ? "border-sage-500 bg-sage-50/70 text-sage-850 font-medium"
                    : "border-gray-100 hover:border-sage-200 bg-white text-gray-600"
                }`}
                id={`insurance-opt-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-medium border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-all"
              id="insurance-back-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!insurance}
              className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
              id="insurance-next-btn"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Preferences & Location */}
      {step === 4 && (
        <div className="space-y-5" id="search-step-4">
          <h3 className="text-lg font-medium text-gray-800 font-display">
            4. Almost done. Any location or specific provider preference?
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-sage-600 uppercase tracking-wider block mb-1.5">
                City / Location (Needed for licensing regulations)
              </label>
              <input
                type="text"
                placeholder="e.g., Seattle, WA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-sage-300 focus:outline-none bg-white text-sm"
                id="location-input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sage-600 uppercase tracking-wider block mb-1.5">
                Provider Preferences (Specialties, Identity, Therapy Style)
              </label>
              <input
                type="text"
                placeholder="e.g., LGBTQ+ friendly, female-identifying, CBT, experienced with adult ADHD"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-sage-300 focus:outline-none bg-white text-sm"
                id="preferences-input"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-medium border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-all"
              id="prep-back-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-75 text-white rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-all"
              id="search-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Formulating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-sage-100 fill-sage-100" />
                  Simplify My Search
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Beautiful Results Output */}
      {step === 5 && plan && (
        <div className="space-y-6" id="search-plan-results">
          {/* Success Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sage-100">
            <div>
              <h3 className="text-xl md:text-2xl font-display font-semibold text-sage-800">
                Your Simplified Search Plan
              </h3>
              <p className="text-xs text-sage-500 mt-1">
                Take a deep breath. We have condensed your search into easily digestible micro-tasks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onSavePlan && (
                <button
                  onClick={() => {
                    onSavePlan(plan, feeling, location || "Online / Open");
                    setSavedPlan(true);
                  }}
                  disabled={savedPlan}
                  className="px-4 py-1.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5"
                  id="plan-save-report-btn"
                >
                  {savedPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved to Logs
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Plan to Logs
                    </>
                  )}
                </button>
              )}
              <button
                onClick={resetForm}
                className="px-4 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-150 text-sage-850 rounded-lg text-xs font-medium cursor-pointer transition-all"
                id="plan-start-over-btn"
              >
                Plan New Search
              </button>
            </div>
          </div>

          {/* Grid Layout of Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Action Items & Directory Info */}
            <div className="space-y-5">
              {/* Action Plan */}
              <div className="bg-sage-50/50 rounded-xl p-5 border border-sage-50/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-800 flex items-center gap-1.5 mb-3">
                  <Check className="w-4 h-4 text-sage-600 stroke-[3]" />
                  1. Three Simple Action Steps
                </h4>
                <ul className="space-y-3">
                  {plan.actionPlan.map((action, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-sage-900">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sage-200 text-sage-800 font-mono text-[10px] shrink-0 font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Directory Filter Keywords */}
              <div className="bg-white rounded-xl p-5 border border-gray-150">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-3">
                  <Filter className="w-4 h-4 text-sage-500" />
                  2. Directory Search Filters
                </h4>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Apply these specific filters/tags in therapist directories (e.g., Psychology Today, TherapyDen) to isolate perfect matches:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.suggestedDirectoryKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screen Consultation Questions */}
              <div className="bg-white rounded-xl p-5 border border-gray-150">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-3">
                  <HelpCircle className="w-4 h-4 text-sage-500" />
                  3. Short Questions to Ask Them
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Ask these during a quick 15-minute introductory call:
                </p>
                <ul className="space-y-2.5">
                  {plan.keyQuestions.map((q, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-gray-700 leading-relaxed">
                      <span className="text-sage-500 font-bold shrink-0">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Custom Email Template */}
            <div className="space-y-5 flex flex-col">
              <div className="bg-sage-800/5 rounded-xl p-5 border border-sage-800/10 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sage-800 flex items-center gap-1.5 mb-2">
                    <Mail className="w-4 h-4 text-sage-600" />
                    4. Email Template to Copypaste
                  </h4>
                  <p className="text-[11px] text-sage-600 mb-3">
                    Copy and paste this message to prospective therapists. Replace bracketed text with your own specifics.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border border-sage-200/60 shadow-inner max-h-[320px] overflow-y-auto">
                    <pre className="text-xs text-sage-950 font-sans whitespace-pre-wrap leading-relaxed select-all">
                      {plan.emailTemplate}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sage-200/40 flex justify-end">
                  <button
                    onClick={copyEmailTemplate}
                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    id="copy-template-btn"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Email Text
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
