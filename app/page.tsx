"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SYSTEM_PROMPT = `You are Aqua, the Hydration Coach. Greet the user warmly. Guide them through hydration planning by asking about their recent activity (heat, alcohol, gym, diet, etc). If their answers match: heat, alcohol, or moderate gym, recommend the 1stick video. If not, offer a hydration tip. Never recommend a video for heavy gym or good diet/hydration. Ask for their email at the start. Keep it conversational and friendly.`;

function getMatchingTags(userAnswers) {
  const tags = [];
  if (/heat|sun|hot/i.test(userAnswers)) tags.push("heat");
  if (/alcohol|drink/i.test(userAnswers)) tags.push("alcohol");
  if (/moderate gym|light gym|workout/i.test(userAnswers)) tags.push("moderate_gym");
  return tags;
}

export default function Page() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Aqua, your Hydration Coach. What's your email to get started?" },
  ]);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [waiting, setWaiting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // OpenAI call
  async function getAgentResponse(history) {
    setWaiting(true);
    try {
      const apiRes = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });
      const data = await apiRes.json();
      setWaiting(false);
      return data.response;
    } catch {
      setWaiting(false);
      return "Sorry, there was a problem contacting Aqua.";
    }
  }

  // Supabase video fetch
  async function fetchVideo(tags) {
    if (!tags.length) return null;
    const { data } = await supabase
      .from("videos")
      .select("*")
      .overlaps("tags", tags)
      .limit(1);
    return data && data.length > 0 ? data[0] : null;
  }

  async function handleSend() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Save email if not yet present
    if (!email && /@/.test(input)) setEmail(input.trim());

    // If we have an email, try to detect tags for video
    let video = null;
    if (email || /@/.test(input)) {
      const tags = getMatchingTags(input);
      video = await fetchVideo(tags);
    }

    // Compose history for OpenAI
    const history = [
      { role: "system", content: SYSTEM_PROMPT },
      ...newMessages.map(m => ({ role: m.role, content: m.content })),
    ];

    let agentResponse = await getAgentResponse(history);
    // If video is appropriate, append video recommendation
    if (video) {
      agentResponse += `\n\nRecommended video: ${video.title}\n`;
      agentResponse += `<video controls width='320' src='${video.url}' style='margin-top:12px;border-radius:12px;box-shadow:0 0 24px #06b6d4;'></video>`;
    }
    setMessages([...newMessages, { role: "assistant", content: agentResponse }]);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center water-background p-4">
      <div className="relative max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 rounded-3xl bg-cyan-400 opacity-30 blur-md water-bar-glow"></div>
        <div className="relative z-10 p-8 water-bar-card flex flex-col gap-4">
          {/* Persona header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-cyan-300 flex items-center justify-center text-3xl shadow-lg border-2 border-white/60">
              💧
            </div>
            <div>
              <div className="font-bold text-lg text-white">Aqua</div>
              <div className="text-cyan-100 text-xs">Your Hydration Coach</div>
            </div>
          </div>
          {/* Chat area */}
          <div className="flex-1 min-h-[240px] max-h-[320px] overflow-y-auto flex flex-col gap-2 pb-2">
            {messages.map((m, i) => (
              <div key={i} className={`rounded-xl px-4 py-2 my-1 ${m.role === "assistant" ? "bg-cyan-900/60 text-cyan-50 self-start" : "bg-white/80 text-cyan-900 self-end"}`}
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
            ))}
            <div ref={chatEndRef}></div>
          </div>
          {/* Input */}
          <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <Input
              className="flex-1 water-bar-input"
              placeholder={waiting ? "Thinking..." : "Type your message..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={waiting}
            />
            <Button type="submit" className="water-bar-button px-5" disabled={waiting || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
