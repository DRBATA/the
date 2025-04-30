// HydrationChat overlay component for hydrationchat page
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ImageIcon, X, Volume2, VolumeX } from "lucide-react";
import { processMessage, analyzeImage } from "../utils/agentService";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: {
    type: "image" | "audio" | "file";
    url: string;
  }[];
}

interface HydrationChatProps {
  onClose: () => void;
}

export default function HydrationChat({ onClose }: HydrationChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `🌞 Welcome to The Water Bar.\n\nI'm your personal hydration assistant, here to help you stay optimally hydrated based on your profile, activities, and environment.\n\nTo get started, I'd love to know a bit about you:\n- What's your name?\n- How active are you generally?\n- What's your approximate weight?\n\nThis helps me provide personalized hydration recommendations just for you. 💧`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userContext, setUserContext] = useState<{ user_id: string; lat: number; lon: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserContext({ user_id: 'demo_user', lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    try {
      const { response } = await processMessage(input, userContext ?? {});
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your message.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image upload (calls analyzeImage stub, which will later call drinks agent)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: "I uploaded an image of my drink.",
        timestamp: new Date().toISOString(),
        attachments: [{ type: "image", url: imageUrl }],
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsProcessing(true);
      try {
        const analysis = await analyzeImage(imageUrl);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `I analyzed your drink image. ${analysis} Would you like me to log this drink for you?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I couldn't analyze that image clearly. Would you like to try again or just tell me what you're drinking?",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-400/90 to-blue-600/90 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">
      {/* Header */}
      <div className="p-4 bg-white/10 backdrop-blur-sm border-b border-white/20 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Hydration Assistant</h2>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/20 backdrop-blur-sm text-white border border-white/20"
                }`}
              >
                {message.attachments?.map(
                  (attachment, index) =>
                    attachment.type === "image" && (
                      <div key={index} className="mb-2 rounded-lg overflow-hidden">
                        <img src={attachment.url || "/placeholder.svg"} alt="Uploaded" className="max-w-full h-auto" />
                      </div>
                    ),
                )}
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Typing indicator */}
        {isProcessing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-white/20 backdrop-blur-sm text-white rounded-2xl p-3 border border-white/20">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area */}
      <div className="p-4 bg-white/10 backdrop-blur-sm border-t border-white/20 flex items-center space-x-2">
        <button
          className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-5 h-5" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          disabled={isProcessing}
        />
        <button
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!input.trim() || isProcessing}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
