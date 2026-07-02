import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Heart, 
  Compass, 
  Phone, 
  Send, 
  Loader2, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  Smile, 
  ArrowRight,
  Shield,
  BookOpen,
  FileText,
  Wind
} from "lucide-react";
import GroundingSpace from "./components/GroundingSpace";
import TherapistSearchHelper from "./components/TherapistSearchHelper";
import CareReports from "./components/CareReports";
import { Message, SupportResource, GroundingLogEntry, SavedSearchPlan, SearchPlan } from "./types";

const CRISIS_RESOURCES: SupportResource[] = [
  {
    id: "988",
    title: "988 Suicide & Crisis Lifeline",
    category: "crisis",
    description: "Free, confidential 24/7 support for anyone in suicidal crisis or emotional distress. Call or text.",
    contact: "988",
    link: "https://988lifeline.org",
    urgent: true
  },
  {
    id: "ctl",
    title: "Crisis Text Line",
    category: "crisis",
    description: "Text with a trained crisis counselor 24/7. Free, high-quality support.",
    contact: "Text HOME to 741741",
    link: "https://www.crisistextline.org",
    urgent: true
  },
  {
    id: "trevor",
    title: "The Trevor Project",
    category: "crisis",
    description: "Crisis intervention and suicide prevention services for LGBTQ+ young people.",
    contact: "1-866-488-7386 or Text START to 678-678",
    link: "https://www.thetrevorproject.org",
    urgent: true
  },
  {
    id: "psy-today",
    title: "Psychology Today Directory",
    category: "directory",
    description: "The largest national directory to filter therapists by insurance, location, specialties, and gender identity.",
    link: "https://www.psychologytoday.com",
    urgent: false
  },
  {
    id: "therapyden",
    title: "TherapyDen Directory",
    category: "directory",
    description: "An inclusive, modern directory focused on social justice, gender-affirming, and culturally competent care.",
    link: "https://www.therapyden.com",
    urgent: false
  },
  {
    id: "openpath",
    title: "Open Path Collective",
    category: "sliding-scale",
    description: "A non-profit network providing affordable, in-office and online psychotherapy sessions ($30-$80).",
    link: "https://openpathcollective.org",
    urgent: false
  }
];

const QUICK_PROMPTS = [
  { text: "I feel incredibly overwhelmed right now.", label: "Feeling Overwhelmed" },
  { text: "How do I ask a therapist if they take my insurance?", label: "Insurance Question" },
  { text: "Give me a gentle grounding exercise to calm down.", label: "Calming Exercise" },
  { text: "What's the difference between CBT and other therapy?", label: "Therapy Types" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "grounding" | "match" | "directory" | "reports">("chat");
  const [activeAgent, setActiveAgent] = useState<"guide" | "somatic" | "navigator">("guide");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello friend, I'm your Empathetic Guide. 🌸\n\nI know that finding help, managing intense anxiety, or choosing a therapist can feel like climbing a mountain. I'm here to help you take simple, tiny, low-pressure steps.\n\nHow can I help support you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Trigger introduction message when switching agents
  const handleAgentSwitch = (agent: "guide" | "somatic" | "navigator") => {
    setActiveAgent(agent);
    let content = "";
    if (agent === "guide") {
      content = "I am your general Empathetic Guide. 🌸 I can help hold space for your feelings or help you navigate your current thoughts. How can I help support you today?";
    } else if (agent === "somatic") {
      content = "I am your Somatic Practice Coach. 🌿 Let's ground your body together. We can count breaths, do sensory check-ins, or physical muscle focus steps directly in this chat. How does your physical body feel right now?";
    } else if (agent === "navigator") {
      content = "I am your Clinical Referral Navigator. 🧭 Let's work together to make finding a real therapist easier. I can help write inquiry letter templates, suggest search terms for directories, or formulate questions. What directory filters or clinical focus can we explore?";
    }

    const switchNotice: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, switchNotice]);
  };

  // Care log and report states
  const [groundingLogs, setGroundingLogs] = useState<GroundingLogEntry[]>(() => {
    const saved = localStorage.getItem("beaconmind_grounding_logs");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedPlans, setSavedPlans] = useState<SavedSearchPlan[]>(() => {
    const saved = localStorage.getItem("beaconmind_saved_plans");
    return saved ? JSON.parse(saved) : [];
  });

  // Automatically sync logs to local storage
  useEffect(() => {
    localStorage.setItem("beaconmind_grounding_logs", JSON.stringify(groundingLogs));
  }, [groundingLogs]);

  useEffect(() => {
    localStorage.setItem("beaconmind_saved_plans", JSON.stringify(savedPlans));
  }, [savedPlans]);

  // Log handlers
  const handleSaveGroundingLog = (entry: Omit<GroundingLogEntry, "id" | "timestamp">) => {
    const newEntry: GroundingLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString()
    };
    setGroundingLogs((prev) => [newEntry, ...prev]);
  };

  const handleSaveSearchPlan = (plan: SearchPlan, feeling: string, location: string) => {
    const newPlan: SavedSearchPlan = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      feeling,
      location,
      plan
    };
    setSavedPlans((prev) => [newPlan, ...prev]);
  };

  const handleDeleteGroundingLog = (id: string) => {
    setGroundingLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleDeleteSavedPlan = (id: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearGroundingLogs = () => {
    setGroundingLogs([]);
  };

  const handleClearSavedPlans = () => {
    setSavedPlans([]);
  };

  // Automatically scroll chat to bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (!textToSend) {
      setInputMessage("");
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory, agent: activeAgent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reach guide server");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const systemErrorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm so sorry, but I had trouble reaching my server. Please make sure the Gemini API key is configured properly. If you need urgent assistance, please check our emergency contacts in the 'Support Directory' tab.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, systemErrorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream text-charcoal-900 selection:bg-sage-200 selection:text-sage-800 flex flex-col font-sans" id="app-root-container">
      
      {/* Visual Header / Branding Area */}
      <header className="border-b border-sage-100 bg-white/70 backdrop-blur-md sticky top-0 z-10" id="app-header">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-500 flex items-center justify-center text-white shadow-md shadow-sage-200" id="logo-icon-container">
              <Sparkles className="w-5.5 h-5.5 fill-white text-sage-100" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-sage-800" id="brand-header-title">
                BeaconMind
              </h1>
              <p className="text-xs text-sage-600 font-medium">Empathetic Mental Health Navigator</p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <nav className="flex items-center gap-1 bg-sage-50 p-1.5 rounded-xl border border-sage-100" id="navigation-tabs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-gray-500 hover:text-sage-800"
              }`}
              id="tab-chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Empathetic Guide
            </button>
            <button
              onClick={() => setActiveTab("grounding")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "grounding"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-gray-500 hover:text-sage-800"
              }`}
              id="tab-grounding"
            >
              <Heart className="w-3.5 h-3.5" />
              Grounding Space
            </button>
            <button
              onClick={() => setActiveTab("match")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "match"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-gray-500 hover:text-sage-800"
              }`}
              id="tab-match"
            >
              <Compass className="w-3.5 h-3.5" />
              Search Planner
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "directory"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-gray-500 hover:text-sage-800"
              }`}
              id="tab-directory"
            >
              <Phone className="w-3.5 h-3.5" />
              Support Directory
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "reports"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-gray-500 hover:text-sage-800"
              }`}
              id="tab-reports"
            >
              <FileText className="w-3.5 h-3.5" />
              Care Reports
              {(groundingLogs.length > 0 || savedPlans.length > 0) && (
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0 ml-0.5" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-6 md:py-8" id="main-content-layout">
        
        {/* Safety First: High-priority Distress / SOS Ribbon */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-3 shadow-sm" id="safety-alert-ribbon">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Experiencing distress or an urgent crisis?
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              If you or someone you know is struggling or in crisis, help is available. 
              Call or text <strong className="text-amber-900 font-bold">988</strong> to reach the Suicide & Crisis Lifeline, or text <strong className="text-amber-900 font-bold">HOME to 741741</strong>. Completely free, confidential, and available 24/7.
            </p>
          </div>
        </div>

        {/* Tab Selection Render Container */}
        <div id="tab-viewport">
          
          {/* TAB 1: EMPATHETIC GUIDE CHAT */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="chat-tab-container">
              
              {/* Left Column: Context Card & Specialist Agent Selector */}
              <div className="space-y-4 lg:col-span-1">
                {/* Agent Selector Card */}
                <div className="bg-white/80 rounded-2xl p-5 border border-sage-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-sage-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-sage-500 animate-pulse" />
                      Specialist Persona
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Toggle between three dedicated agents calibrated for specific supportive focus areas.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAgentSwitch("guide")}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        activeAgent === "guide"
                          ? "border-sage-500 bg-sage-50/70 text-sage-900 shadow-sm font-semibold"
                          : "border-gray-100 hover:border-sage-200 bg-white text-gray-500"
                      }`}
                      id="agent-switch-guide"
                    >
                      <Smile className="w-4.5 h-4.5 text-sage-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-sage-850">Empathetic Guide</span>
                          {activeAgent === "guide" && <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-normal">Active listening, slow emotional validation & safe processing.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAgentSwitch("somatic")}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        activeAgent === "somatic"
                          ? "border-sage-500 bg-sage-50/70 text-sage-900 shadow-sm font-semibold"
                          : "border-gray-100 hover:border-sage-200 bg-white text-gray-500"
                      }`}
                      id="agent-switch-somatic"
                    >
                      <Wind className="w-4.5 h-4.5 text-sage-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-sage-850">Somatic Coach</span>
                          {activeAgent === "somatic" && <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-normal">Guided in-chat breathing timers, body scans & calming exercises.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAgentSwitch("navigator")}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        activeAgent === "navigator"
                          ? "border-sage-500 bg-sage-50/70 text-sage-900 shadow-sm font-semibold"
                          : "border-gray-100 hover:border-sage-200 bg-white text-gray-500"
                      }`}
                      id="agent-switch-navigator"
                    >
                      <Compass className="w-4.5 h-4.5 text-sage-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-sage-850">Clinical Navigator</span>
                          {activeAgent === "navigator" && <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-normal">Directory filters, consulting questions & outreach email drafts.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Common Places to Start & Grounding Note */}
                <div className="bg-white/80 rounded-2xl p-5 border border-sage-100 shadow-sm space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider block">
                      Common places to start
                    </span>
                    <div className="space-y-1.5 flex flex-col">
                      {QUICK_PROMPTS.map((qp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qp.text)}
                          disabled={isSending}
                          className="text-left w-full px-3 py-2 rounded-xl text-xs bg-sage-50/50 border border-sage-100/50 text-sage-800 hover:bg-sage-100/60 hover:border-sage-200 transition-all cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap disabled:opacity-50"
                          id={`quick-prompt-${idx}`}
                        >
                          {qp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex items-start gap-2 text-[11px] text-sage-600 leading-relaxed">
                    <BookOpen className="w-4.5 h-4.5 text-sage-500 shrink-0 mt-0.5" />
                    <p>
                      Too overwhelmed to text? Try our physical <button onClick={() => setActiveTab("grounding")} className="underline font-medium text-sage-700 hover:text-sage-800 cursor-pointer">Grounding Space</button> to regulate your heartbeat with visual pacers immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Interface Column */}
              <div className="lg:col-span-2 flex flex-col h-[520px] bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden" id="chat-interface-window">
                
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
                    <span className="text-xs font-semibold text-sage-800">Active Guidance Session</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Conversational AI Safe Space</span>
                </div>

                {/* Messages Panel */}
                <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-sage-50/10" id="messages-scroll-area">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm transition-all ${
                          msg.role === "user"
                            ? "bg-sage-600 text-white rounded-tr-none"
                            : "bg-white border border-gray-150 text-gray-800 rounded-tl-none whitespace-pre-wrap"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span
                          className={`text-[9px] block text-right mt-1.5 font-mono ${
                            msg.role === "user" ? "text-sage-200" : "text-gray-400"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs shadow-sm flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sage-500" />
                        <span className="text-gray-400">Guide is typing gently...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Inputs */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message or feeling... (e.g., I'm feeling really anxious about starting)"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-300 focus:outline-none text-xs bg-gray-50/50"
                      disabled={isSending}
                      id="chat-text-input"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isSending || !inputMessage.trim()}
                      className="p-3 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:cursor-not-allowed"
                      id="chat-send-btn"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SOMATIC GROUNDING (GROUNDING SPACE) */}
          {activeTab === "grounding" && (
            <div className="space-y-6" id="grounding-tab-container">
              <GroundingSpace onSaveLog={handleSaveGroundingLog} />
            </div>
          )}

          {/* TAB 3: THERAPIST SEARCH PLANNER */}
          {activeTab === "match" && (
            <div className="space-y-6" id="match-tab-container">
              <TherapistSearchHelper onSavePlan={handleSaveSearchPlan} />
            </div>
          )}

          {/* TAB 4: CRISIS & SUPPORT RESOURCES DIRECTORY */}
          {activeTab === "directory" && (
            <div className="space-y-6" id="directory-tab-container">
              
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-medium text-sage-800">
                  Care Resource Directories
                </h2>
                <p className="text-sm text-sage-600 mt-2">
                  Avoid searching blind. We have curated high-quality, trusted networks and immediate safety supports to assist you.
                </p>
              </div>

              {/* Crisis Resources (Urgent Priority) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  Urgent, Free, and 24/7 Safety Lines
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CRISIS_RESOURCES.filter(r => r.urgent).map((res) => (
                    <div key={res.id} className="bg-red-50/30 border border-red-100 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 uppercase tracking-wider">
                          Crisis Support
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800 mt-2.5">
                          {res.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-red-50 flex items-center justify-between">
                        {res.contact && (
                          <span className="text-xs font-mono font-bold text-red-900 bg-red-100/50 px-2.5 py-1 rounded-md">
                            {res.contact}
                          </span>
                        )}
                        {res.link && (
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-red-700 hover:text-red-900 inline-flex items-center gap-1 hover:underline"
                          >
                            Visit Site <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Urgent Directories and Sliding Scales */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sage-700">
                  National Directories & Affordable Care
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CRISIS_RESOURCES.filter(r => !r.urgent).map((res) => (
                    <div key={res.id} className="bg-white border border-sage-100 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          res.category === "sliding-scale" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-sage-100 text-sage-800"
                        }`}>
                          {res.category === "sliding-scale" ? "Sliding Scale" : "Directory"}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800 mt-2.5">
                          {res.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                        {res.link && (
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-sage-700 hover:text-sage-800 inline-flex items-center gap-1 hover:underline"
                          >
                            Explore Directory <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: CARE LOGS & REFERRAL REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-6" id="reports-tab-container">
              <CareReports
                groundingLogs={groundingLogs}
                savedPlans={savedPlans}
                onClearGroundingLogs={handleClearGroundingLogs}
                onClearSavedPlans={handleClearSavedPlans}
                onDeleteGroundingLog={handleDeleteGroundingLog}
                onDeleteSavedPlan={handleDeleteSavedPlan}
              />
            </div>
          )}

        </div>
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-sage-100 bg-white/40 py-6 text-center text-xs text-sage-500" id="app-footer">
        <p>© {new Date().getFullYear()} BeaconMind. Designed to make seeking help gentle and frictionless.</p>
        <p className="mt-1 text-[11px] text-gray-400">Disclaimer: BeaconMind is a clinical navigation aid and does not provide formal therapy or emergency services.</p>
      </footer>
    </div>
  );
}
