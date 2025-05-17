import React from 'react';
import NeonTriangle from './NeonTriangle';
import ResponsiveNeonTriangle from './ResponsiveNeonTriangle';

export default function Dashboard({ plan, profile }: { plan: any, profile: any }) {
  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: 32 }}>

      <h2 style={{ textAlign: 'center', color: '#00ffff', fontWeight: 500, letterSpacing: 1 }}>Hydration Plan</h2>
      {plan ? (
        <div
          style={{
            marginTop: 18,
            color: '#003344',
            fontSize: 20,
            background: 'rgba(255,255,255,0.60)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 24px #00ffff33',
            backdropFilter: 'blur(18px)',
            border: '2px solid rgba(0,255,255,0.15)',
            position: 'relative',
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div><b>Fluids:</b> {plan.fluids_target_ml} mL</div>
          <div><b>Sodium:</b> {plan.na_target_mg} mg</div>
          <div><b>Potassium:</b> {plan.k_target_mg} mg</div>
          <div><b>Magnesium:</b> {plan.mg_target_mg} mg</div>
          <div style={{ marginTop: 12, color: '#00aaaa', fontSize: 16 }}>{plan.explanation}</div>
          {/* Warning for high fluid target */}
          {plan.fluids_target_ml > 4000 && (
            <div style={{ color: '#ff0077', marginTop: 14, fontWeight: 600, fontSize: 16 }}>
              ⚠️ This is a very high fluid recommendation. Most adults need 2000–3500 mL per day. Please check your profile inputs!
            </div>
          )}
          <div style={{ color: '#009fff', marginTop: 10, fontSize: 14, opacity: 0.7 }}>
            Typical adult needs: 2–3.5L fluids, 1500mg sodium, 3500mg potassium, 400mg magnesium
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 32, color: '#00ffffcc', textAlign: 'center', fontSize: 18 }}>
          <span>Let’s get your profile set up below…</span>
        </div>
      )}
    </div>
  );
}
