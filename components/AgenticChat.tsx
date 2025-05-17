import React, { useState, useRef, useEffect } from 'react';

type Message = { sender: 'assistant' | 'user', text: string };

type AgenticChatProps = {
  messages: Message[];
  onSend: (msg: string) => void;
  loading: boolean;
  input: string;
  setInput: (v: string) => void;
  customUI: any;
  onCustomUISelect: (v: string) => void;
};

export default function AgenticChat({ messages, onSend, loading, input, setInput, customUI, onCustomUISelect }: AgenticChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 20, background: 'none', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', pointerEvents: 'auto', padding: '0 0 18px 0' }}>
        {/* Chat area */}
        <div style={{
          maxHeight: 300,
          minHeight: 120,
          overflowY: 'auto',
          padding: '18px 0 8px 0',
          marginBottom: 8,
          background: 'rgba(255,255,255,0.13)',
          borderRadius: 18,
          boxShadow: '0 2px 18px #00ffff33',
          backdropFilter: 'blur(12px) saturate(1.2)',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 12, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              <span style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? 'rgba(0,255,249,0.13)' : 'rgba(255,255,255,0.18)',
                color: msg.sender === 'user' ? '#00fff9' : '#003c5f',
                padding: '10px 18px',
                borderRadius: 18,
                boxShadow: msg.sender === 'user' ? '0 2px 12px #00ffff22' : '0 2px 12px #00ffff33',
                fontWeight: 500,
                maxWidth: '90%',
                wordBreak: 'break-word',
                backdropFilter: 'blur(8px) saturate(1.3)',
                border: '1.2px solid #6ffcff33',
              }}>{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.22)', borderRadius: 18, padding: '12px 16px', boxShadow: '0 2px 12px #00ffff22', backdropFilter: 'blur(15px) saturate(1.2)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSend(input); }}
            placeholder="Ask about your hydration..."
            style={{
              flex: 1,
              fontSize: 18,
              borderRadius: 22,
              border: '1.5px solid #00fff966',
              padding: '12px 20px',
              outline: 'none',
              background: 'rgba(255,255,255,0.18)',
              color: '#003c5f',
              marginRight: 12,
              boxShadow: '0 2px 12px #00ffff22',
              transition: 'border 0.2s',
            }}
            disabled={loading}
          />
          <button
            onClick={() => onSend(input)}
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #00fff9 0%, #00bfff 100%)',
              color: '#003c5f',
              border: 'none',
              borderRadius: 22,
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: 18,
              boxShadow: '0 2px 12px #00ffff44',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            Send
          </button>
        </div>
        {/* Custom UI (dropdown/buttons) */}
        {customUI && customUI.type === 'dropdown' && Array.isArray(customUI.options) && (
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <label style={{ color: '#00ffff', fontSize: 18, marginRight: 8 }}>{customUI.label || 'Choose one:'}</label>
            <select
              style={{ fontSize: 18, padding: '10px 18px', borderRadius: 12, border: '1.5px solid #00ffff77', background: 'rgba(255,255,255,0.16)', color: '#003c5f', marginRight: 8 }}
              onChange={e => onCustomUISelect(e.target.value)}
              defaultValue={''}
            >
              <option value="" disabled>Select...</option>
              {customUI.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        {customUI && customUI.type === 'buttons' && Array.isArray(customUI.options) && (
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            {customUI.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => onCustomUISelect(opt)}
                style={{ margin: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(90deg, #00fff9 0%, #00bfff 100%)', color: '#003c5f', border: 'none', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
