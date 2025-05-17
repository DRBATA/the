"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuickHydrationIntroDay() {
  const [form, setForm] = useState({
    email: "",
    height_cm: "",
    weight_kg: "",
    fluids_normal_ml: "",
    fluids_electrolyte_ml: "",
    protein_grams: "",
    sex: "female",
  });
  const [plan, setPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  function calculatePlan({
    weight_kg,
    sex,
    fluids_normal_ml,
    fluids_electrolyte_ml,
    protein_grams,
  }: any) {
    const weight = Number(weight_kg);
    const baseline = 35 * weight;
    const protein_adjust = Number(protein_grams) * 10;
    const total_intake =
      Number(fluids_normal_ml) + Number(fluids_electrolyte_ml);
    const target = baseline + protein_adjust;
    const remaining = Math.max(0, target - total_intake);

    // Compartments
    const tbw = (sex === "male" ? 0.6 : 0.5) * weight;
    const icf = tbw * (2 / 3);
    const ecf = tbw * (1 / 3);
    const isf = ecf * (3 / 4);
    const ivf = ecf * (1 / 4);

    return {
      target_ml: Math.round(target),
      already_had_ml: Math.round(total_intake),
      remaining_ml: Math.round(remaining),
      advice: `Drink ${Math.round(remaining)} mL more today. Include at least one electrolyte drink if active.`,
      tbw: tbw.toFixed(1),
      icf: icf.toFixed(1),
      isf: isf.toFixed(1),
      ivf: ivf.toFixed(1),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const planObj = calculatePlan(form);
    setPlan(planObj);
    setSaving(true);

    // Save to DB
    await supabase.from("hydration_intake").insert([
      {
        email: form.email,
        fluids_normal_ml: Number(form.fluids_normal_ml),
        fluids_electrolyte_ml: Number(form.fluids_electrolyte_ml),
        protein_grams: Number(form.protein_grams),
      },
    ]);
    await supabase.from("hydration_compartments").insert([
      {
        email: form.email,
        tbw_liters: planObj.tbw,
        icf_liters: planObj.icf,
        isf_liters: planObj.isf,
        ivf_liters: planObj.ivf,
      },
    ]);
    await supabase.from("hydration_plan").insert([
      {
        email: form.email,
        target_ml: planObj.target_ml,
        already_had_ml: planObj.already_had_ml,
        remaining_ml: planObj.remaining_ml,
        advice: planObj.advice,
        plan_json: planObj,
      },
    ]);
    setSaving(false);
  }

  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({ email: form.email });
    setMagicLinkSent(!error);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #C2E9FB 0%, #A1C4FD 100%)",
      }}
    >
      {/* Fullscreen Dubai Background */}
      <img
        src="/background1.png"
        alt="Hydration event background with yoga and neon drinks bar in Dubai"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.82, filter: "blur(2px) saturate(1.1)" }}
        aria-hidden="true"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-0" style={{
        background: "linear-gradient(180deg, rgba(0,255,255,0.15) 0%, rgba(0,0,0,0.25) 100%)"
      }} />

      {/* Centered Neon Glass Panel */}
      <div
        className="relative z-10 w-full max-w-2xl p-12 md:p-16 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border border-cyan-200"
        style={{
          background: "rgba(255,255,255,0.42)",
          border: "2.5px solid #00fff9",
          boxShadow: "0 12px 48px 0 #00bfff66, 0 0 42px 0 #00fff999, 0 2px 32px 0 #003c5f33",
          backdropFilter: "blur(18px) saturate(1.2)",
        }}
      >
        {/* Neon Triangle and Title */}
        <div className="flex flex-col items-center mb-6">
          <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
            <polygon
              points="35,5 65,55 5,55"
              style={{
                stroke: "#00fff9",
                strokeWidth: 4,
                filter: "drop-shadow(0 0 12px #00fff9)",
                fill: "none"
              }}
            />
          </svg>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg" style={{
            textShadow: "0 0 10px #00fff9, 0 0 20px #00fff9"
          }}>WATER BAR HYDRATION TRACKER</h1>
        </div>

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-lg">
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <input
            required
            type="number"
            placeholder="Height (cm)"
            value={form.height_cm}
            onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <input
            required
            type="number"
            placeholder="Weight (kg)"
            value={form.weight_kg}
            onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <select
            value={form.sex}
            onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <input
            required
            type="number"
            placeholder="Normal fluids today (mL)"
            value={form.fluids_normal_ml}
            onChange={e => setForm(f => ({ ...f, fluids_normal_ml: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <input
            required
            type="number"
            placeholder="Electrolyte fluids today (mL)"
            value={form.fluids_electrolyte_ml}
            onChange={e => setForm(f => ({ ...f, fluids_electrolyte_ml: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <input
            required
            type="number"
            placeholder="Protein intake (g)"
            value={form.protein_grams}
            onChange={e => setForm(f => ({ ...f, protein_grams: e.target.value }))}
            className="rounded-2xl px-7 py-5 text-xl bg-white/90 border-2 border-cyan-300 shadow-lg focus:ring-4 focus:ring-cyan-300 focus:outline-none font-semibold text-cyan-800 placeholder-cyan-400 transition-all duration-200"
            style={{ boxShadow: "0 2px 16px #00bfff22" }}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl px-7 py-5 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-xl hover:from-cyan-300 hover:to-blue-300 transition-all duration-200 mt-2"
            style={{ boxShadow: "0 4px 32px #00bfff33, 0 0 16px #00fff966" }}
          >
            {saving ? "Saving..." : "Calculate & Save"}
          </button>
        </form>
        {plan && (
          <div className="mt-8 p-6 bg-white/90 rounded-2xl shadow-lg border border-cyan-200 text-cyan-900 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Your Hydration Plan</h2>
            <div className="mb-2">Target: <span className="font-semibold">{plan.target_ml} mL</span></div>
            <div className="mb-2">Already had: <span className="font-semibold">{plan.already_had_ml} mL</span></div>
            <div className="mb-2">Remaining: <span className="font-semibold">{plan.remaining_ml} mL</span></div>
            <div className="mb-2">Advice: <span className="font-semibold">{plan.advice}</span></div>
            <div className="mt-4 text-sm text-cyan-700">
              <div>Total Body Water: {plan.tbw} L</div>
              <div>ICF: {plan.icf} L</div>
              <div>ISF: {plan.isf} L</div>
              <div>IVF: {plan.ivf} L</div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center mt-8 gap-2">
          <button
            onClick={sendMagicLink}
            className="rounded-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-white font-bold shadow hover:from-cyan-300 hover:to-blue-300 transition"
          >
            Send Magic Link to Email
          </button>
          {magicLinkSent && (
            <div className="text-green-600 font-semibold mt-2">Magic link sent! Check your inbox.</div>
          )}
        </div>
      </div>
    </div>
  );
}
