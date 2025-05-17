import React, { useEffect, useState } from 'react';

const TABS = [
  { key: 'drink', label: 'Drinks' },
  { key: 'food', label: 'Foods' },
  { key: 'activity', label: 'Activities' },
  { key: 'supplement', label: 'Supplements' }
];

export default function LibraryPicker({ onAdd }: { onAdd: (item: any) => void }) {
  const [tab, setTab] = useState('drink');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/library-items?type=${tab}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load library');
        setLoading(false);
      });
  }, [tab]);

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', background: '#f8fafc', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px #e0e7ef22' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: tab === t.key ? '#bae6fd' : '#e0e7ef',
              color: tab === t.key ? '#0369a1' : '#334155',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <div style={{ maxHeight: 340, overflowY: 'auto', marginTop: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #e0e7ef',
              gap: 8
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>{item.description}</div>
                <div style={{ fontSize: 13, color: '#334155' }}>{item.default_amount ? `Default: ${item.default_amount} ${item.default_unit}` : ''}</div>
              </div>
              <button
                onClick={() => onAdd(item)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 7,
                  border: 'none',
                  background: '#36b37e',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer'
                }}
              >Add</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
