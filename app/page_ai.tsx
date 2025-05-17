"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/user-context';
import AgenticChat from '../components/AgenticChat';
import PlanProjectionTabs from "@/components/PlanProjectionTabs";

// Plan card UI
function PlanCard({ plan }: { plan: any }) {
  if (!plan) return null;
  // Support both old and new plan shapes
  const p = plan.plan ? plan.plan : plan;
  return (
    <div style={{
      margin: '32px auto 16px auto',
      padding: 24,
      maxWidth: 420,
      background: 'linear-gradient(90deg, #00fff9 0%, #00bfff 100%)',
      borderRadius: 18,
      boxShadow: '0 4px 32px #00bfff44',
      color: '#003c5f',
      textAlign: 'center',
      fontWeight: 600,
      fontSize: 20,
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Your Hydration Plan</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#003c5f', margin: '8px 0' }}>
        {p.hydration_target_ml ? `${(p.hydration_target_ml/1000).toFixed(2)} L target` : null}
      </div>
      {p.current_progress_ml !== undefined && (
        <div style={{ fontSize: 18, margin: '8px 0' }}>
          <b>Progress:</b> {p.current_progress_ml} mL ({p.progress_percent || 0}% of target)
        </div>
      )}
      {p.extra_needed_ml !== undefined && (
        <div style={{ fontSize: 18, margin: '8px 0' }}>
          <b>Still Needed:</b> {p.extra_needed_ml} mL
        </div>
      )}
      {p.sodium_gap_mg !== undefined && (
        <div style={{ fontSize: 18, margin: '8px 0' }}>
          <b>Na Gap:</b> {p.sodium_gap_mg > 0 ? `Need ${p.sodium_gap_mg} mg more` : `Surplus ${Math.abs(p.sodium_gap_mg)} mg`}
        </div>
      )}
      {p.status && (
        <div style={{ fontSize: 16, margin: '8px 0', color: '#003c5faa' }}>
          <b>Status:</b> {p.status}
        </div>
      )}
      {p.electrolytes && (
        <div style={{ fontSize: 16, margin: '8px 0', color: '#003c5faa' }}>
          <b>Electrolytes:</b> {p.electrolytes}
        </div>
      )}
      {p.plan && (
        <div style={{ fontSize: 18, margin: '8px 0', color: '#003c5f' }}>
          <b>Plan:</b> {p.plan}
        </div>
      )}
      {p.advice && (
        <div style={{ fontSize: 16, margin: '8px 0', color: '#003c5faa', fontStyle: 'italic' }}>
          {p.advice}
        </div>
      )}
    </div>
  );
}

// --- Fetch helpers ---
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function fetchFinalTimelineState(user_id: string, day_date: string) {
  const { data, error } = await supabase
    .from('hydration_timeline')
    .select('*')
    .eq('user_id', user_id)
    .eq('day_date', day_date)
    .order('hour', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

async function fetchPlanCard(user_id: string, day_date: string) {
  const { data, error } = await supabase
    .from('hydration_plan_cards')
    .select('*')
    .eq('user_id', user_id)
    .eq('day_date', day_date)
    .single();
  if (error) throw error;
  return data;
}

export default function Home() {
  const { user, isLoading: userLoading } = useUser();
  const [messages, setMessages] = useState<{ sender: 'assistant' | 'user', text: string }[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [customUI, setCustomUI] = useState<any>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [planCard, setPlanCard] = useState<any>(null);

  // Fetch plan card on mount (when user loads)
  useEffect(() => {
    if (userLoading || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    fetchPlanCard(user.id, today).then(setPlanCard).catch(() => setPlanCard(null));
  }, [userLoading, user]);

  // On mount, start chat if user is authenticated (simulate for now)
  // Ensure agentic flow only starts once per session/user
  const [agenticStarted, setAgenticStarted] = useState(false);
  useEffect(() => {
    console.log('useEffect: userLoading', userLoading);
    console.log('useEffect: user', user);
    console.log('useEffect: agenticStarted', agenticStarted);
    if (userLoading || !user || agenticStarted) {
      console.log('useEffect: Skipping due to userLoading, !user, or agenticStarted');
      return;
    }
    setAgenticStarted(true);
    async function startAgenticFlow() {
      console.log('startAgenticFlow: Starting...');
      setLoading(true);
      try {
        const res = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user!.id, message: '', history: [] }) // user is checked above
        });
        console.log('startAgenticFlow: Response received');
        const data = await res.json();
        console.log('startAgenticFlow: Parsed data:', data);
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages.map((msg: any) =>
            typeof msg === 'string'
              ? { sender: 'assistant' as const, text: msg }
              : { sender: 'assistant' as const, text: msg.text || String(msg) }
          ));
        }
        if (data.plan) setPlan(data.plan);
        else if (data.results) setPlan(data.results);
        if (data.ui) setCustomUI(Array.isArray(data.ui) ? data.ui : [data.ui]);
        else setCustomUI([]);
      } catch (e) {
        console.error('startAgenticFlow: Error:', e);
        setMessages([{ sender: 'assistant' as const, text: 'Sorry, there was an error starting the chat.' }]);
      }
      setLoading(false);
      console.log('startAgenticFlow: Finished');
    }
    startAgenticFlow();
    return () => {};
  }, [userLoading, user, agenticStarted]);

  // Handle user sending a message
  const handleSend = async (msg: string) => {
    if (!msg.trim() || userLoading || !user) return;
    // Build the full chat history including this user message
    const newHistory: { sender: 'user' | 'assistant'; text: string }[] = [
      ...messages,
      { sender: 'user' as const, text: msg }
    ];
    setMessages(newHistory);
    setLoading(true);
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user!.id, message: msg, history: newHistory }) // user is checked above
      });
      let dataText = await res.text();
      let data;
      // Remove code fences if present
      const jsonMatch = dataText.match(/```json\s*([\s\S]*?)```/i);
      try {
        data = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(dataText);
      } catch (e) {
        data = {};
      }
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(msgs => [
          ...msgs,
          ...data.messages.map((msg: any) =>
            typeof msg === 'string'
              ? { sender: 'assistant' as const, text: msg }
              : { sender: 'assistant' as const, text: msg.text || String(msg) }
          )
        ]);
      }
      // If agent output includes a structured log, auto-POST it to /api/plan and update plan UI
      let log = null;
      if (data.log) log = data.log;
      // Try also to extract log from scratchpad if present
      if (!log && data.scratchpad) {
        try {
          const scratchMatch = typeof data.scratchpad === 'string' && data.scratchpad.match(/"log"\s*:\s*(\[[^\]]*\])/);
          if (scratchMatch) log = JSON.parse(scratchMatch[1]);
        } catch {}
      }
      if (log && user) {
        // Compose plan input from user profile if available
        const planInput = {
          height_cm: user.height_cm || user.height || 170,
          weight_kg: user.weight_kg || user.weight || 70,
          age: user.age || 30,
          sex: user.sex || 'unknown',
          log
        };
        try {
          const planRes = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planInput)
          });
          const planData = await planRes.json();
          setPlan(planData.plan || planData);
        } catch (e) {
          setMessages(msgs => [...msgs, { sender: 'assistant' as const, text: 'Sorry, there was an error calculating your hydration plan.' }]);
        }
      } else {
        if (data.plan) setPlan(data.plan);
        else if (data.results) setPlan(data.results);
      }
      if (data.ui) setCustomUI(Array.isArray(data.ui) ? data.ui : [data.ui]);
      else setCustomUI([]);
    } catch {
      setMessages(msgs => [...msgs, { sender: 'assistant' as const, text: 'Sorry, there was an error. Please try again.' }]);
    }
    setLoading(false);
  };

  // Handle custom UI selection
  const handleCustomUISelect = async (value: string) => {
    setInput(value);
    await handleSend(value);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #e0f7fa 0%, #f5fcff 100%)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 8px 0 8px' }}>
        {/* Plan/Projection Tabs with Accordions */}
        <PlanProjectionTabs />
        {/* Plan card from chat (fallback) */}
        {!planCard && plan && <PlanCard plan={plan} />}
        {/* Chat UI */}
        <AgenticChat
          messages={messages}
          onSend={handleSend}
          loading={loading}
          input={input}
          setInput={setInput}
          customUI={customUI}
          onCustomUISelect={handleCustomUISelect}
        />
      </div>
    </div>
  );
}