import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Heart, Info, Check, Eye, Fingerprint, Volume2, Wind, Utensils, Save, Sparkles, Smile, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BreathingPattern, GroundingLogEntry } from "../types";

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: "box",
    label: "Box Breathing",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: "The Navy SEAL protocol for rapid focus, stress relief, and nervous system reset."
  },
  {
    name: "fourSevenEight",
    label: "4-7-8 Relax",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: "Deep relaxation method developed by Dr. Andrew Weil. Exceptional for sleep and panic."
  },
  {
    name: "calm",
    label: "Calm Inducing",
    inhale: 4,
    hold1: 2,
    exhale: 4,
    hold2: 2,
    description: "A gentle, restorative pattern that stabilizes erratic heart rates."
  },
  {
    name: "equal",
    label: "Equal Breath (Pranayama)",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    description: "Promotes balance, mental clarity, and matches inhale to exhale duration."
  }
];

interface GroundingSpaceProps {
  onSaveLog: (entry: Omit<GroundingLogEntry, "id" | "timestamp">) => void;
}

export default function GroundingSpace({ onSaveLog }: GroundingSpaceProps) {
  const [activeMode, setActiveMode] = useState<"breathing" | "sensory">("breathing");

  // --- BREATHING STATES ---
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [secondsLeft, setSecondsLeft] = useState<number>(BREATHING_PATTERNS[0].inhale);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [breathMessage, setBreathMessage] = useState<string>("Ready when you are");
  
  // Stress logging states (Breathing)
  const [preStressBreath, setPreStressBreath] = useState<number>(5);
  const [postStressBreath, setPostStressBreath] = useState<number>(3);
  const [loggedBreath, setLoggedBreath] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentState("inhale");
    setSecondsLeft(selectedPattern.inhale);
    setCyclesCompleted(0);
    setBreathMessage("Ready to start");
    setLoggedBreath(false);
  }, [selectedPattern, activeMode]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            let nextState: "inhale" | "hold1" | "exhale" | "hold2" = "inhale";
            let nextDuration = 0;
            let message = "";

            if (currentState === "inhale") {
              if (selectedPattern.hold1 > 0) {
                nextState = "hold1";
                nextDuration = selectedPattern.hold1;
                message = "Hold your breath...";
              } else {
                nextState = "exhale";
                nextDuration = selectedPattern.exhale;
                message = "Exhale slowly...";
              }
            } else if (currentState === "hold1") {
              nextState = "exhale";
              nextDuration = selectedPattern.exhale;
              message = "Exhale slowly...";
            } else if (currentState === "exhale") {
              if (selectedPattern.hold2 > 0) {
                nextState = "hold2";
                nextDuration = selectedPattern.hold2;
                message = "Hold empty...";
              } else {
                nextState = "inhale";
                nextDuration = selectedPattern.inhale;
                message = "Inhale deeply...";
                setCyclesCompleted((c) => c + 1);
              }
            } else if (currentState === "hold2") {
              nextState = "inhale";
              nextDuration = selectedPattern.inhale;
              message = "Inhale deeply...";
              setCyclesCompleted((c) => c + 1);
            }

            setCurrentState(nextState);
            setBreathMessage(message);
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentState, selectedPattern]);

  const togglePlay = () => {
    if (!isPlaying) {
      setBreathMessage("Inhale deeply...");
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentState("inhale");
    setSecondsLeft(selectedPattern.inhale);
    setCyclesCompleted(0);
    setBreathMessage("Ready to start");
    setLoggedBreath(false);
  };

  const saveBreathingLog = () => {
    onSaveLog({
      type: "breathing",
      patternLabel: selectedPattern.label,
      preStress: preStressBreath,
      postStress: postStressBreath
    });
    setLoggedBreath(true);
  };

  const getBubbleScale = () => {
    if (!isPlaying) return 1.0;
    switch (currentState) {
      case "inhale":
        const inhalePercent = (selectedPattern.inhale - secondsLeft) / selectedPattern.inhale;
        return 1.0 + (inhalePercent * 0.7);
      case "hold1":
        return 1.7;
      case "exhale":
        const exhalePercent = secondsLeft / selectedPattern.exhale;
        return 1.0 + (exhalePercent * 0.7);
      case "hold2":
        return 1.0;
      default:
        return 1.0;
    }
  };

  const getAmbientBgColor = () => {
    if (!isPlaying) return "bg-sage-100 border-sage-200 text-sage-600";
    switch (currentState) {
      case "inhale":
        return "bg-sage-200 border-sage-300 text-sage-800 shadow-[0_0_40px_-5px_rgba(107,142,115,0.4)]";
      case "hold1":
        return "bg-sage-300 border-sage-400 text-sage-800 shadow-[0_0_50px_0_rgba(107,142,115,0.6)]";
      case "exhale":
        return "bg-sage-100 border-sage-200 text-sage-700 shadow-[0_0_30px_-10px_rgba(107,142,115,0.3)]";
      case "hold2":
        return "bg-cream border-sage-100 text-sage-600";
      default:
        return "bg-sage-100 border-sage-200 text-sage-600";
    }
  };


  // --- SENSORY 5-4-3-2-1 GROUNDING STATES ---
  const [sensoryStep, setSensoryStep] = useState<number>(1); // Steps 1 to 5, then completed (6)
  const [seeInputs, setSeeInputs] = useState<string[]>(["", "", "", "", ""]);
  const [touchInputs, setTouchInputs] = useState<string[]>(["", "", "", ""]);
  const [hearInputs, setHearInputs] = useState<string[]>(["", "", ""]);
  const [smellInputs, setSmellInputs] = useState<string[]>(["", ""]);
  const [tasteInput, setTasteInput] = useState<string>("");

  const [preStressSensory, setPreStressSensory] = useState<number>(5);
  const [postStressSensory, setPostStressSensory] = useState<number>(3);
  const [loggedSensory, setLoggedSensory] = useState<boolean>(false);

  const startSensoryStep = (stepNum: number) => {
    setSensoryStep(stepNum);
  };

  const handleSensorySubmit = () => {
    onSaveLog({
      type: "sensory-54321",
      preStress: preStressSensory,
      postStress: postStressSensory,
      sensoryInputs: {
        see: seeInputs.filter(Boolean),
        touch: touchInputs.filter(Boolean),
        hear: hearInputs.filter(Boolean),
        smell: smellInputs.filter(Boolean),
        taste: tasteInput
      }
    });
    setLoggedSensory(true);
    setSensoryStep(6); // Show sensory completion card
  };

  const resetSensory = () => {
    setSensoryStep(1);
    setSeeInputs(["", "", "", "", ""]);
    setTouchInputs(["", "", "", ""]);
    setHearInputs(["", "", ""]);
    setSmellInputs(["", ""]);
    setTasteInput("");
    setLoggedSensory(false);
  };

  return (
    <div className="space-y-6" id="grounding-root">
      
      {/* Mode Switcher Buttons */}
      <div className="flex justify-center mb-4">
        <div className="bg-sage-100/60 border border-sage-200/50 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveMode("breathing")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === "breathing"
                ? "bg-sage-600 text-white shadow-sm"
                : "text-sage-700 hover:text-sage-900"
            }`}
            id="sub-tab-breathing"
          >
            <Wind className="w-4 h-4" />
            Guided Breathing
          </button>
          <button
            onClick={() => setActiveMode("sensory")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === "sensory"
                ? "bg-sage-600 text-white shadow-sm"
                : "text-sage-700 hover:text-sage-900"
            }`}
            id="sub-tab-sensory"
          >
            <Fingerprint className="w-4 h-4" />
            5-4-3-2-1 Sensory Grounding
          </button>
        </div>
      </div>

      {/* MODE A: BREATHING SPACE */}
      {activeMode === "breathing" && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sage-100 shadow-sm max-w-3xl mx-auto" id="breathing-card">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            {/* Left Column: Controls */}
            <div className="flex-1 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-50 text-sage-850 border border-sage-100 mb-3">
                  <Wind className="w-3.5 h-3.5 text-sage-500" />
                  Somatic Breath Regulator
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-sage-800">
                  Breathing Pacer
                </h2>
                <p className="text-xs text-sage-600 mt-2 max-w-md">
                  Rhythmic breathing stimulates the vagus nerve, sending immediate biological signals to decelerate stress.
                </p>
              </div>

              {/* Pattern Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-sage-500">
                  Choose a Breath Timing
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BREATHING_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.name}
                      onClick={() => setSelectedPattern(pattern)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        selectedPattern.name === pattern.name
                          ? "border-sage-500 bg-sage-50/70 shadow-sm text-sage-900"
                          : "border-gray-100 hover:border-sage-200 bg-white text-gray-500"
                      }`}
                      id={`pattern-select-${pattern.name}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{pattern.label}</span>
                        {selectedPattern.name === pattern.name && (
                          <Check className="w-3.5 h-3.5 text-sage-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        Inhale: {pattern.inhale}s • Exhale: {pattern.exhale}s
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-sage-50/50 rounded-xl p-4 border border-sage-50 text-xs text-sage-750 flex items-start gap-2">
                <Info className="w-4.5 h-4.5 text-sage-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {selectedPattern.description}
                </p>
              </div>

              {/* STRESS LOG CARD ON FINISH */}
              <div className="border-t border-sage-100 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Save className="w-4 h-4 text-sage-500" />
                  Log this somatic practice
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Stress Level Before ({preStressBreath}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={preStressBreath}
                      onChange={(e) => setPreStressBreath(Number(e.target.value))}
                      className="w-full accent-sage-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Stress Level Now ({postStressBreath}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postStressBreath}
                      onChange={(e) => setPostStressBreath(Number(e.target.value))}
                      className="w-full accent-sage-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={saveBreathingLog}
                  disabled={loggedBreath || cyclesCompleted === 0}
                  className="w-full py-2 bg-sage-50 hover:bg-sage-100 disabled:opacity-50 border border-sage-150 text-sage-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {loggedBreath ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sage-600" /> Logged! Saved to Care Reports
                    </>
                  ) : cyclesCompleted === 0 ? (
                    "Complete at least 1 cycle to log"
                  ) : (
                    "Save Practice to Care Reports"
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Visual bubble */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 bg-sage-50/10 rounded-2xl border border-dashed border-sage-100 min-h-[320px]">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-sage-100/40 border border-sage-200/50"
                      animate={{
                        scale: getBubbleScale() * 1.15,
                        opacity: [0.1, 0.4, 0.1],
                      }}
                      transition={{
                        duration: secondsLeft || 1,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  style={{ scale: getBubbleScale() }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className={`w-28 h-28 rounded-full border flex flex-col items-center justify-center transition-colors duration-1000 ${getAmbientBgColor()}`}
                >
                  <div className="text-center select-none">
                    <span className="font-display text-4xl font-semibold block tracking-tighter">
                      {secondsLeft}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-75">
                      {isPlaying ? currentState : "ready"}
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="text-center mt-5 h-6">
                <p className="text-xs font-semibold text-sage-800">
                  {breathMessage}
                </p>
              </div>

              {cyclesCompleted > 0 && (
                <span className="text-[10px] text-sage-500 font-mono mt-1">
                  Completed Cycles: {cyclesCompleted}
                </span>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-sage-500 hover:bg-sage-600 text-white shadow-md cursor-pointer transition-all"
                >
                  {isPlaying ? <Pause className="w-4.5 h-4.5 fill-white" /> : <Play className="w-4.5 h-4.5 fill-white ml-0.5" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 shadow-sm cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: SENSORY 5-4-3-2-1 GROUNDING */}
      {activeMode === "sensory" && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sage-100 shadow-sm max-w-2xl mx-auto" id="sensory-card">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-50 text-sage-850 border border-sage-100 mb-2">
              <Fingerprint className="w-3.5 h-3.5 text-sage-600" />
              Mindfulness Somatic Detour
            </span>
            <h2 className="text-2xl font-display font-semibold text-sage-800">
              5-4-3-2-1 Grounding Practice
            </h2>
            <p className="text-xs text-sage-600 mt-1">
              Pull your brain away from panic loops and focus entirely on your physical surroundings.
            </p>
          </div>

          {/* STEP 1: Pre-Stress Level */}
          {sensoryStep === 1 && (
            <div className="space-y-5" id="sensory-step-1">
              <div className="bg-sage-50/50 rounded-xl p-4 border border-sage-50">
                <h4 className="text-xs font-semibold text-sage-800">Why are we starting here?</h4>
                <p className="text-xs text-sage-650 leading-relaxed mt-1">
                  Caseworkers use this exercise to ground individuals experiencing acute panic. Before we look around, let's log your starting level of distress or stress.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase block">
                  Current Distress Level ({preStressSensory}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preStressSensory}
                  onChange={(e) => setPreStressSensory(Number(e.target.value))}
                  className="w-full accent-sage-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>1 - Completely Peaceful</span>
                  <span>10 - Intense Panic/Distress</span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => startSensoryStep(2)}
                  className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  Begin Grounding <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Sight (5 Things) */}
          {sensoryStep === 2 && (
            <div className="space-y-4" id="sensory-step-2">
              <div className="flex items-center gap-2 text-sage-800">
                <Eye className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-semibold font-display">1. SIGHT - Five things you can see around you</h3>
              </div>
              <p className="text-xs text-gray-600">
                Look around. Identify 5 physical objects. Small details count—a spot on the wall, a glass, a shadow.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {seeInputs.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Object ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const copy = [...seeInputs];
                      copy[idx] = e.target.value;
                      setSeeInputs(copy);
                    }}
                    className="p-2 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => startSensoryStep(3)}
                  disabled={seeInputs.some(v => !v.trim())}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Touch (4 Things) */}
          {sensoryStep === 3 && (
            <div className="space-y-4" id="sensory-step-3">
              <div className="flex items-center gap-2 text-sage-800">
                <Fingerprint className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-semibold font-display">2. TOUCH - Four things you can feel</h3>
              </div>
              <p className="text-xs text-gray-600">
                Bring awareness to physical sensations: the weight of your feet, the collar on your neck, the cool table surface.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {touchInputs.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Sensation ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const copy = [...touchInputs];
                      copy[idx] = e.target.value;
                      setTouchInputs(copy);
                    }}
                    className="p-2 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => startSensoryStep(2)}
                  className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => startSensoryStep(4)}
                  disabled={touchInputs.some(v => !v.trim())}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Hear (3 Things) */}
          {sensoryStep === 4 && (
            <div className="space-y-4" id="sensory-step-4">
              <div className="flex items-center gap-2 text-sage-800">
                <Volume2 className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-semibold font-display">3. HEAR - Three distinct sounds</h3>
              </div>
              <p className="text-xs text-gray-600">
                Close your eyes for 5 seconds. What whispers, refrigerator hums, birds, or background traffic can you capture?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {hearInputs.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Sound ${idx + 1}`}
                    value={val}
                    onChange={(e) => {
                      const copy = [...hearInputs];
                      copy[idx] = e.target.value;
                      setHearInputs(copy);
                    }}
                    className="p-2 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => startSensoryStep(3)}
                  className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => startSensoryStep(5)}
                  disabled={hearInputs.some(v => !v.trim())}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Smell & Taste */}
          {sensoryStep === 5 && (
            <div className="space-y-5" id="sensory-step-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sage-800">
                    <Wind className="w-4.5 h-4.5 text-sage-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">4. SMELL - Two scents</h4>
                  </div>
                  <input
                    type="text"
                    placeholder="Scent 1 (e.g., coffee, laundry)"
                    value={smellInputs[0]}
                    onChange={(e) => {
                      const copy = [...smellInputs];
                      copy[0] = e.target.value;
                      setSmellInputs(copy);
                    }}
                    className="w-full p-2.5 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                  <input
                    type="text"
                    placeholder="Scent 2 (e.g., wood, lotion, soap)"
                    value={smellInputs[1]}
                    onChange={(e) => {
                      const copy = [...smellInputs];
                      copy[1] = e.target.value;
                      setSmellInputs(copy);
                    }}
                    className="w-full p-2.5 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sage-800">
                    <Utensils className="w-4.5 h-4.5 text-sage-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">5. TASTE - One flavor</h4>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., mint toothpaste, tea, dry mouth"
                    value={tasteInput}
                    onChange={(e) => setTasteInput(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 focus:border-sage-300 focus:outline-none rounded-xl text-xs bg-gray-50/50"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    If nothing is nearby, simply describe the general taste in your mouth right now.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">
                  Stress level after sensory detour ({postStressSensory}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={postStressSensory}
                  onChange={(e) => setPostStressSensory(Number(e.target.value))}
                  className="w-full accent-sage-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-between pt-3">
                <button
                  onClick={() => startSensoryStep(4)}
                  className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleSensorySubmit}
                  disabled={!tasteInput.trim() || smellInputs.some(s => !s.trim())}
                  className="px-5 py-2.5 bg-sage-600 hover:bg-sage-750 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Check className="w-4.5 h-4.5 text-sage-100" /> Finish & Log Grounding
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Finished Card */}
          {sensoryStep === 6 && (
            <div className="text-center py-6 space-y-5" id="sensory-step-6">
              <div className="w-16 h-16 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center mx-auto">
                <Smile className="w-8 h-8 text-sage-600" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-display font-semibold text-sage-800">Grounding Session Completed</h3>
                <p className="text-xs text-sage-600 max-w-sm mx-auto">
                  You successfully shifted your attention from internal anxiety loops to immediate sensory signals. Great job taking care of yourself.
                </p>
              </div>

              <div className="bg-sage-50 rounded-xl p-4 max-w-sm mx-auto border border-sage-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Symptom Change:</span>
                <span className="font-mono font-bold text-sage-800">
                  {preStressSensory} → {postStressSensory} (Stress decreased by {Math.max(0, preStressSensory - postStressSensory)} levels)
                </span>
              </div>

              <div className="pt-3">
                <button
                  onClick={resetSensory}
                  className="px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all"
                >
                  Practice Again
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
