import React from "react";

const compartments = [
  {
    name: "Blood Vessels (IVF)",
    current: "3.0 L",
    target: "3.0 L",
    explanation: "IVF: Water in blood vessels, critical for blood pressure and perfusion."
  },
  {
    name: "Between Cells (ISF)",
    current: "12.0 L",
    target: "12.0 L",
    explanation: "ISF: Water between cells, supports nutrient/waste exchange."
  },
  {
    name: "Inside Cells (ICF)",
    current: "25.0 L",
    target: "25.0 L",
    explanation: "ICF: Water inside cells, vital for cell function."
  }
];

export default function TrajectoryCard() {
  return (
    <div style={{
      margin: '0 auto 24px auto',
      padding: 20,
      background: 'linear-gradient(90deg, #f0f4ff 0%, #e0e7ef 100%)',
      borderRadius: 18,
      boxShadow: '0 2px 16px #e0e7ef22',
      color: '#334155',
      fontWeight: 500,
      fontSize: 18,
      textAlign: 'left',
      maxWidth: 600
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Projected Body Water Compartments</div>
      <div style={{ fontSize: 16, color: '#64748b', marginBottom: 20 }}>
        This shows your estimated body water distribution if you take no action today. Compare each compartment to the ideal target.
      </div>
      {compartments.map((c, idx) => (
        <div key={c.name} style={{
          marginBottom: 18,
          padding: 14,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 6px #e0e7ef11',
        }}>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{c.name}</div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 6 }}>
            <span>Current: <b>{c.current}</b></span>
            <span>Target: <b>{c.target}</b></span>
          </div>
          <div style={{ fontSize: 15, color: '#64748b' }}>{c.explanation}</div>
        </div>
      ))}
    </div>
  );
}
