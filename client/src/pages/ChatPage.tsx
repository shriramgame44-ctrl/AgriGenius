import React, { useState } from "react";
import { useAgri } from "../context/AgriContext";
import {
  Send,
  Mic,
  Camera,
  Check,
  CheckCheck,
  Play,
  Pause,
  DollarSign,
  Heart,
  ThumbsUp,
  Handshake,
  Sparkles,
  Phone,
  Info,
  Clock,
  CheckCircle2,
  X,
  Volume2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  type: "text" | "voice" | "image" | "offer";
  content?: string;
  audioDuration?: string;
  image?: string;
  offerAmount?: number;
  offerQuantity?: number;
  offerStatus?: "pending" | "accepted" | "countered";
  timestamp: string;
  isRead: boolean;
  reaction?: string;
}

export const ChatPage: React.FC = () => {
  const { language, activeChatListing, addLedgerEntry, isOffline } = useAgri();

  const [activeContact, setActiveContact] = useState({
    name: "Rajesh Veg Wholesaler",
    role: "Verified Buyer • Azadpur Mandi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    isOnline: true,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "them",
      type: "text",
      content: "Namaste Gurpreet ji! I saw your fresh Sharbati wheat listing. Can you share photo proof of grain moisture?",
      timestamp: "10:14 AM",
      isRead: true,
    },
    {
      id: "m-2",
      sender: "me",
      type: "image",
      content: "Harvested yesterday, sun-dried to 11.5% moisture.",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80",
      timestamp: "10:16 AM",
      isRead: true,
      reaction: "🌾",
    },
    {
      id: "m-3",
      sender: "me",
      type: "voice",
      audioDuration: "0:18",
      timestamp: "10:17 AM",
      isRead: true,
    },
    {
      id: "m-4",
      sender: "them",
      type: "offer",
      offerAmount: 2350,
      offerQuantity: 50,
      offerStatus: "pending",
      content: "Official Wholesale Purchase Offer",
      timestamp: "10:20 AM",
      isRead: true,
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(2400);
  const [offerQty, setOfferQty] = useState(50);
  const [dealAcceptedNotice, setDealAcceptedNotice] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: "m-" + Date.now(),
      sender: "me",
      type: "text",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate buyer auto-reply after 2 seconds
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "m-" + (Date.now() + 1),
          sender: "them",
          type: "text",
          content: "Acknowledged! Reviewing logistics now.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: true,
        },
      ]);
    }, 2000);
  };

  const handleSendVoiceNote = () => {
    const newVoice: ChatMessage = {
      id: "m-" + Date.now(),
      sender: "me",
      type: "voice",
      audioDuration: "0:14",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newVoice]);
  };

  const handleAcceptOffer = (messageId: string, amount: number, qty: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, offerStatus: "accepted" } : m))
    );

    // Auto-log to ledger
    const totalEarnings = amount * qty;
    addLedgerEntry({
      type: "income",
      category: "produce_sale",
      title: `Sold ${qty} Quintals produce to ${activeContact.name} via Chat`,
      amount: totalEarnings,
      notes: `Deal negotiated in-app. Rate: ₹${amount}/Qtl`,
    });

    setDealAcceptedNotice(true);
    setTimeout(() => setDealAcceptedNotice(false), 3000);
  };

  const handleSendOfferCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: ChatMessage = {
      id: "m-" + Date.now(),
      sender: "me",
      type: "offer",
      offerAmount: offerPrice,
      offerQuantity: offerQty,
      offerStatus: "pending",
      content: "Farmer Counter-Offer Card",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newOffer]);
    setOfferModalOpen(false);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m))
    );
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
            />
            {activeContact.isOnline && (
              <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{activeContact.name}</h3>
            <p className="text-[11px] text-emerald-700 font-medium">{activeContact.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOfferModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Make Offer</span>
          </button>

          <button
            className="p-2 rounded-xl text-slate-500 hover:bg-stone-100 transition-colors"
            title="Audio Call"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Pinned Deal Context Pill (Instagram-style Product Tag) */}
      <div className="px-4 py-2 bg-gradient-to-r from-stone-50 to-emerald-50/50 border-b border-stone-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="p-1 bg-emerald-700 text-white rounded font-bold text-[10px]">
            ACTIVE DEAL
          </span>
          <span className="font-bold text-slate-800 truncate">
            {activeChatListing
              ? `${activeChatListing.cropName} (${activeChatListing.quantityQuintals} Qtl) • Asking ₹${activeChatListing.askingPricePerQuintal}/Qtl`
              : "Sharbati Golden Wheat (65 Quintals) • Asking ₹2,450/Qtl"}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          Rampur Cluster • Direct Transport
        </span>
      </div>

      {/* Success Notification Banner */}
      {dealAcceptedNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Deal Accepted! Contract generated & ₹1,17,500 logged to Khata Ledger.</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60">
        {messages.map((msg) => {
          const isMe = msg.sender === "me";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
            >
              <div
                className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl relative shadow-xs ${
                  isMe
                    ? "bg-emerald-700 text-white rounded-br-xs"
                    : "bg-white text-slate-900 border border-stone-200 rounded-bl-xs"
                }`}
              >
                {/* Text Message */}
                {msg.type === "text" && (
                  <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                )}

                {/* Image Message */}
                {msg.type === "image" && (
                  <div className="space-y-2">
                    <img
                      src={msg.image}
                      alt="Crop lot proof"
                      className="rounded-xl w-full max-h-48 object-cover"
                    />
                    {msg.content && <p className="text-xs">{msg.content}</p>}
                  </div>
                )}

                {/* Voice Note Message */}
                {msg.type === "voice" && (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() =>
                        setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isMe ? "bg-white text-emerald-800" : "bg-emerald-700 text-white"
                      }`}
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    {/* Simulated Waveform */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[4, 12, 18, 8, 22, 14, 20, 10, 16, 6, 14, 8, 20, 12].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-full ${
                            isMe ? "bg-emerald-200" : "bg-emerald-600"
                          } ${playingVoiceId === msg.id ? "animate-pulse" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold opacity-80">{msg.audioDuration}</span>
                  </div>
                )}

                {/* Interactive Offer Card (Instagram DM Bargaining Card) */}
                {msg.type === "offer" && (
                  <div
                    className={`p-3 rounded-xl border ${
                      isMe
                        ? "bg-emerald-800 border-emerald-600"
                        : "bg-blue-50/80 border-blue-200"
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isMe ? "text-emerald-200" : "text-blue-900"}>
                        {msg.content}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          msg.offerStatus === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {msg.offerStatus}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className={`text-xl font-black ${isMe ? "text-white" : "text-slate-900"}`}>
                        ₹{msg.offerAmount}
                        <span className="text-xs font-normal opacity-80"> / Quintal</span>
                      </p>
                      <p className={`text-xs ${isMe ? "text-emerald-100" : "text-slate-600"}`}>
                        Total: {msg.offerQuantity} Quintals ={" "}
                        <strong>₹{(msg.offerAmount || 0) * (msg.offerQuantity || 0)}</strong>
                      </p>
                    </div>

                    {msg.offerStatus === "pending" && !isMe && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() =>
                            handleAcceptOffer(msg.id, msg.offerAmount || 0, msg.offerQuantity || 0)
                          }
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Deal</span>
                        </button>
                        <button
                          onClick={() => setOfferModalOpen(true)}
                          className="py-1.5 px-3 bg-white text-slate-800 font-bold text-xs rounded-lg border border-stone-300 hover:bg-stone-50 cursor-pointer"
                        >
                          Counter
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: Time & Status */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    isMe ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe &&
                    (msg.isRead ? (
                      <CheckCheck className="w-3 h-3 text-emerald-200" />
                    ) : (
                      <Clock className="w-3 h-3 text-emerald-200" />
                    ))}
                </div>
              </div>

              {/* Reaction badge & emoji picker trigger */}
              <div className="flex items-center gap-1 text-xs">
                {msg.reaction && (
                  <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded-full shadow-xs text-xs">
                    {msg.reaction}
                  </span>
                )}
                <div className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-1 bg-white p-1 rounded-full border border-stone-200 shadow-xs">
                  {["❤️", "👍", "🤝", "🌾"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform px-1 text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-stone-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Voice Note Record Simulation */}
          <button
            type="button"
            onClick={handleSendVoiceNote}
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            title="Send Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Camera Proof Simulation */}
          <button
            type="button"
            onClick={() => {
              const newPhoto: ChatMessage = {
                id: "m-" + Date.now(),
                sender: "me",
                type: "image",
                content: "Field sample uploaded.",
                image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=500&q=80",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isRead: false,
              };
              setMessages((prev) => [...prev, newPhoto]);
            }}
            className="p-2.5 rounded-xl bg-stone-100 text-slate-600 hover:bg-stone-200 transition-colors"
            title="Attach Photo Proof"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "संदेश लिखें या आवाज़ रिकॉर्ड करें..."
                : language === "mr"
                ? "संदेश लिहा किंवा आवाज रेकॉर्ड करा..."
                : "Type message or bargain rate..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Make Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Send Official Counter-Offer</h3>
              <button onClick={() => setOfferModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSendOfferCard} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Proposed Price (₹ / Quintal)
                </label>
                <input
                  type="number"
                  min="500"
                  step="10"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min="5"
                  value={offerQty}
                  onChange={(e) => setOfferQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                Total Deal Amount: <strong>₹{offerPrice * offerQty}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Offer Card in Chat</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
