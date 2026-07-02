export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SearchPlan {
  actionPlan: string[];
  emailTemplate: string;
  keyQuestions: string[];
  suggestedDirectoryKeywords: string[];
}

export interface SavedSearchPlan {
  id: string;
  timestamp: string;
  feeling: string;
  location: string;
  plan: SearchPlan;
}

export interface GroundingLogEntry {
  id: string;
  timestamp: string;
  type: "breathing" | "sensory-54321";
  patternLabel?: string;
  preStress: number;
  postStress: number;
  sensoryInputs?: {
    see: string[];
    touch: string[];
    hear: string[];
    smell: string[];
    taste: string;
  };
}

export interface SupportResource {
  id: string;
  title: string;
  category: "crisis" | "directory" | "tool" | "sliding-scale";
  description: string;
  contact?: string;
  link?: string;
  urgent: boolean;
}

export type BreathingPatternName = "box" | "fourSevenEight" | "calm" | "equal";

export interface BreathingPattern {
  name: BreathingPatternName;
  label: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
}

