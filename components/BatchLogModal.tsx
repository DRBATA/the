import React, { useState } from 'react';
import LibraryPicker from './LibraryPicker';

export default function BatchLogModal({
  open,
  onClose,
  onSubmit,
  defaultTime
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (logs: any[], time: string) => void;
  defaultTime?: string;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [time, setTime] = useState(defaultTime || new Date().toISOString().slice(0,16)); // ISO string, no seconds

  const handleAdd = (item: any) => {
    // Prompt for amount/unit if needed
    let amount = item.default_amount || '';
    let unit = item.default_unit || '';
    let customAmount = window.prompt(`Amount for ${item.name}:`, amount);
    if (customAmount === null) return; // cancelled
    amount = customAmount;
    setLogs([...logs, { ...item, amount, unit, timestamp: time }]);
  };

  const handleRemove = (idx: number) => {
    setLogs(logs.filter((_, i) => i !== idx));
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 650, width: '100%', padding: 32, boxShadow: '0 8px 32px #0002', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Log Items for a Time</h2>
        <label style={{ display: 'block', marginBottom: 12 }}>
          Time:
          <input
            type="datetime-local"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #e0e7ef', fontSize: 15 }}
          />
        </label>
        <LibraryPicker onAdd={handleAdd} />
        <div style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 7 }}>Items to Log:</h3>
          {logs.length === 0 ? <div style={{ color: '#64748b' }}>No items added yet.</div> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {logs.map((log, idx) => (
                <li key={idx} style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>{log.name}</span>
                  <span style={{ color: '#64748b', fontSize: 14 }}>{log.amount} {log.unit}</span>
                  <button onClick={() => handleRemove(idx)} style={{ marginLeft: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          disabled={logs.length === 0}
          onClick={() => {
            onSubmit(logs, time);
            setLogs([]);
            onClose();
          }}
          style={{ marginTop: 18, padding: '10px 32px', borderRadius: 8, background: '#36b37e', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: logs.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Confirm Logs for This Time
        </button>
      </div>
    </div>
  );
}
