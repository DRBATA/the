import React from "react";

export default function BodyTypePrompt({ options, onSelect, onManual, loading }: {
  options: string[];
  onSelect: (type: string) => void;
  onManual: () => void;
  loading?: boolean;
}) {
  return (
    <div style={{ padding: 24, background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 8px #e0e7ef22', maxWidth: 420, margin: '32px auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Body Composition</h2>
      <p style={{ marginBottom: 16 }}>Please select your body type, or <button style={{ color: '#0369a1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={onManual}>enter body fat % manually</button>.</p>
      {loading ? (
        <div>Loading body types...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {options.map((type) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid #e0e7ef',
                background: '#fff',
                color: '#334155',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: 4
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
