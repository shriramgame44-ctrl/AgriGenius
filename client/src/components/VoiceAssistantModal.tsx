import React, { useState, useEffect } from "react";
import { useAgri } from "../context/AgriContext";
import { Mic, MicOff, Volume2, X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const VoiceAssistantModal: React.FC = () => {
  const { voiceModalOpen, setVoiceModalOpen, language } = useAgri();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [actionRoute, setActionRoute] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (voiceModalOpen) {
      setIsListening(true);
      setTranscript("");
      setAiAnswer(null);
      setActionRoute(null);
      setActionLabel(null);

      // Simulate voice capture
      const timer1 = setTimeout(() => {
        if (language === "hi") {
          setTranscript("गेहूं की फसल में पीला रतुआ लग गया है, कौन सी खाद और दवा डालूं?");
        } else if (language === "mr") {
          setTranscript("गव्हाच्या पिकावर पिवळा तांबेरा आला आहे, कोणते खत आणि औषध टाकू?");
        } else {
          setTranscript("Yellow rust spotted on my wheat leaves, what fertilizer and spray should I apply?");
        }
        setIsListening(false);
      }, 2200);

      const timer2 = setTimeout(() => {
        if (language === "hi") {
          setAiAnswer(
            "निदान: पीला रतुआ (Yellow Rust)। तुरंत प्रोपिकोनाज़ोल 25% EC (1 मिली/लीटर पानी) का छिड़काव करें और प्रति एकड़ 20 किलो पोटाश डालें। आज हवा की गति 7 किमी/घंटा है, छिड़काव के लिए मौसम अनुकूल है।"
          );
          setActionLabel("उर्वरक स्टोर में दवा देखें (₹420)");
          setActionRoute("/store");
        } else if (language === "mr") {
          setAiAnswer(
            "निदान: पिवळा तांबेरा (Yellow Rust). ताबडतोब प्रोपिकोनाझोल 25% EC (1 मिली/लिटर पाणी) फवारा आणि एकरी 20 किलो पोटॅश द्या. आज फवारणीसाठी हवामान अनुकूल आहे."
          );
          setActionLabel("औषध व खत खरेदी करा (₹420)");
          setActionRoute("/store");
        } else {
          setAiAnswer(
            "Diagnosis: Yellow Rust (Puccinia striiformis). Spray Propiconazole 25% EC @ 1ml/L water immediately, and supplement with 20kg MOP (Potash) per acre. Today's wind is 7 km/h, perfect for spraying."
          );
          setActionLabel("View Recommended Cure in Store ($5.50 / ₹420)");
          setActionRoute("/store");
        }
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [voiceModalOpen, language]);

  if (!voiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {language === "hi" ? "कृषि वाणी सहायक" : language === "mr" ? "कृषी वाणी साहाय्यक" : "AgriGenius Voice Assistant"}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {language === "hi" ? "अपनी भाषा में बोलें" : language === "mr" ? "तुमच्या भाषेत बोला" : "Speak in Hindi, Marathi, or English"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVoiceModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-6">
          {/* Animated Mic Waveform */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <span className="absolute -inset-3 rounded-full bg-emerald-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                isListening
                  ? "bg-rose-600 text-white scale-110 shadow-rose-600/30"
                  : "bg-emerald-600 text-white hover:scale-105 shadow-emerald-600/30"
              }`}
            >
              {isListening ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isListening
                ? language === "hi"
                  ? "सुन रहा हूँ... बोलिए"
                  : language === "mr"
                  ? "ऐकत आहे... बोला"
                  : "Listening... speak now"
                : language === "hi"
                ? "आवाज़ दर्ज की गई"
                : language === "mr"
                ? "आवाज नोंदवला गेला"
                : "Voice Captured"}
            </span>
            {transcript && (
              <p className="mt-2 text-base font-semibold text-slate-800 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                "{transcript}"
              </p>
            )}
          </div>

          {/* AI Response Card */}
          {aiAnswer && (
            <div className="text-left bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === "hi" ? "सलाह व समाधान" : language === "mr" ? "उपाय व सल्ला" : "AI Agronomy Prescription"}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  <Volume2 className="w-3 h-3" /> 0:12 Audio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {aiAnswer}
              </p>
              {actionRoute && (
                <button
                  onClick={() => {
                    setVoiceModalOpen(false);
                    navigate(actionRoute);
                  }}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Quick Voice Suggestions */}
          {!transcript && (
            <div className="space-y-2 pt-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === "hi" ? "उदाहरण प्रश्न:" : language === "mr" ? "उदाहरणे प्रश्न:" : "Example queries:"}
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-slate-700 cursor-pointer">
                  {language === "hi" ? "आज टमाटर का भाव क्या है?" : "What is the tomato mandi rate today?"}
                </span>
                <span className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-slate-700 cursor-pointer">
                  {language === "hi" ? "यूरिया की कितनी बोरी लगेगी?" : "How much urea for 3 acres?"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
