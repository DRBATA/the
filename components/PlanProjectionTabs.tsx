import React, { useState, useEffect } from "react";
import { useUser } from '../contexts/user-context';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function usePlanSections(user_id: string, event_date: string) {
  const [sections, setSections] = useState<any[]>([]);
  useEffect(() => {
    if (!user_id || !event_date) return;
    fetch(`/api/plan-recommendations?user_id=${user_id}&event_date=${event_date}`)
      .then(res => res.json())
      .then(data => {
        if (data.plan && Array.isArray(data.plan.recommendations)) {
          setSections(data.plan.recommendations.map((rec: any, idx: number) => ({
            label: `Step ${idx + 1}`,
            content: `${rec.action}${rec.reason ? ' — ' + rec.reason : ''}`
          })));
        } else {
          setSections([{ label: 'No Plan', content: 'No plan generated yet.' }]);
        }
      });
  }, [user_id, event_date]);
  return sections;
}

function useProjectionSummary(user_id: string, event_date: string) {
  const [data, setData] = useState<null | {
    ivf_loss_ml: number;
    isf_loss_ml: number;
    icf_loss_ml: number;
    loss_stage: string;
    calculation_basis: string;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user_id || !event_date) return;
    setLoading(true);
    setError(null);
    supabase
      .from('projected_loss_summary')
      .select('ivf_loss_ml, isf_loss_ml, icf_loss_ml, loss_stage, calculation_basis')
      .eq('user_id', user_id)
      .eq('event_date', event_date)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (data && data.length > 0) setData(data[0]);
        else setError('No summary found.');
        setLoading(false);
      });
  }, [user_id, event_date]);

  return { data, loading, error };
}

function Accordion({ sections }: { sections: { label: string, content: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ width: '100%' }}>
      {sections.map((section, idx) => (
        <div key={section.label} style={{ marginBottom: 12 }}>
          <button
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              background: '#f3f6fc',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: openIdx === idx ? '0 2px 8px #e0e7ef44' : 'none'
            }}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            {section.label}
          </button>
          {openIdx === idx && (
            <div style={{
              padding: '16px',
              background: '#fff',
              borderRadius: 8,
              marginTop: 2,
              fontSize: 15,
              color: '#334155',
              boxShadow: '0 1px 6px #e0e7ef11'
            }}>
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import BodyTypePrompt from './BodyTypePrompt';

import BatchLogModal from './BatchLogModal';

export default function PlanProjectionTabs({ event_date }: { event_date: string }) {
  const [tab, setTab] = useState<'plan' | 'projection'>('plan');
  const { user, isLoading } = useUser();
  const user_id = user?.id;

  // State for API stepwise response
  const [stepwise, setStepwise] = useState<any>(null);
  const [loadingStepwise, setLoadingStepwise] = useState(false);
  const [manualBodyFat, setManualBodyFat] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!user_id || !event_date) return;
    setLoadingStepwise(true);
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, event_date, event: { type: 'session_start', timestamp: new Date().toISOString() } })
    })
      .then(res => res.json())
      .then(data => {
        setStepwise(data);
        setLoadingStepwise(false);
      });
  }, [user_id, event_date]);

  // Only call useProjectionSummary if both user_id and event_date are defined
  const hasUserAndDate = !!user_id && !!event_date;
  const summary = hasUserAndDate ? useProjectionSummary(user_id, event_date) : { data: null, loading: true, error: null };
  const { data, loading, error } = summary;

  if (isLoading || !user_id) {
    return <div>Loading user...</div>;
  }
  if (!event_date) {
    return <div>No date selected.</div>;
  }

  // Batch log modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSteps, setBatchSteps] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Handle body type selection UI
  if (stepwise?.require_body_type && stepwise.body_type_options) {
    if (showManual) {
      return (
        <div style={{ padding: 24, background: '#f8fafc', borderRadius: 14, maxWidth: 420, margin: '32px auto' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Enter Body Fat %</h2>
          <input
            type="number"
            value={manualBodyFat}
            onChange={e => setManualBodyFat(e.target.value)}
            placeholder="e.g. 22"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e7ef', fontSize: 16, width: 100, marginRight: 8 }}
          />
          <button
            onClick={async () => {
              if (!manualBodyFat) return;
              setLoadingStepwise(true);
              await fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, event_date, profile_updates: { body_fat_pct: Number(manualBodyFat) } })
              });
              setShowManual(false);
              setManualBodyFat('');
              // Reload stepwise
              setLoadingStepwise(true);
              fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, event_date, event: { type: 'session_start', timestamp: new Date().toISOString() } })
              })
                .then(res => res.json())
                .then(data => {
                  setStepwise(data);
                  setLoadingStepwise(false);
                });
            }}
            style={{ padding: 8, borderRadius: 6, background: '#0369a1', color: '#fff', fontWeight: 600 }}
          >Submit</button>
        </div>
      );
    }
    return (
      <BodyTypePrompt
        options={stepwise.body_type_options}
        onSelect={async (type) => {
          setLoadingStepwise(true);
          await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, event_date, profile_updates: { body_composition_label: type } })
          });
          // Reload stepwise
          fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, event_date, event: { type: 'session_start', timestamp: new Date().toISOString() } })
          })
            .then(res => res.json())
            .then(data => {
              setStepwise(data);
              setLoadingStepwise(false);
            });
        }}
        onManual={() => setShowManual(true)}
        loading={loadingStepwise}
      />
    );
  }

  const projectionSections = loading
    ? [{ label: 'Loading...', content: 'Fetching projection summary...' }]
    : error || !data
      ? [{ label: 'Error', content: error || 'No data' }]
      : [
          {
            label: 'Blood Vessels (IVF)',
            content: `Loss: ${data.ivf_loss_ml} mL\nStage: ${data.loss_stage}\nBasis: ${data.calculation_basis}`
          },
          {
            label: 'Between Cells (ISF)',
            content: `Loss: ${data.isf_loss_ml} mL\nStage: ${data.loss_stage}\nBasis: ${data.calculation_basis}`
          },
          {
            label: 'Inside Cells (ICF)',
            content: `Loss: ${data.icf_loss_ml} mL\nStage: ${data.loss_stage}\nBasis: ${data.calculation_basis}`
          }
        ];

  return (
    <>
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
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <button
            onClick={() => setTab('plan')}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: tab === 'plan' ? '#bae6fd' : '#e0e7ef',
              color: tab === 'plan' ? '#0369a1' : '#334155',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Plan
          </button>
          <button
            onClick={() => setTab('projection')}
            style={{
              padding: '8px 24px',
              borderRadius: 8,
              border: 'none',
              background: tab === 'projection' ? '#bae6fd' : '#e0e7ef',
              color: tab === 'projection' ? '#0369a1' : '#334155',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Projection
          </button>
        </div>
        <div>
          {tab === 'plan' ? (
            <Accordion sections={usePlanSections(user_id, event_date)} />
          ) : (
            <Accordion sections={projectionSections} />
          )}
        </div>
      </div>
      {/* Floating batch log button */}
      <button
        onClick={() => setShowBatchModal(true)}
        style={{
          position: 'fixed', bottom: 36, right: 36, zIndex: 1200,
          padding: '16px 32px', borderRadius: 40, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 18,
          boxShadow: '0 4px 24px #2563eb44', border: 'none', cursor: 'pointer', letterSpacing: 1
        }}
      >
        Log Hydration/Activity
      </button>
      <BatchLogModal
        open={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onSubmit={async (logs, time) => {
          setBatchLoading(true);
          const event_date = time.slice(0,10); // YYYY-MM-DD
          const events = logs.map(log => ({
            type: 'log',
            category: log.category,
            name: log.name,
            amount: log.amount,
            unit: log.unit,
            timestamp: log.timestamp || time
          }));
          const res = await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, event_date, events, finalize_batch: true })
          });
          const data = await res.json();
          setBatchSteps(data.steps || []);
          setBatchLoading(false);
        }}
      />
      {/* Show agentic stepwise response after batch log */}
      {batchSteps.length > 0 && (
        <div style={{ position: 'fixed', bottom: 120, right: 36, zIndex: 1200, maxWidth: 340 }}>
          {batchSteps.map((step, idx) => (
            <div key={idx} style={{
              background: '#f0f9ff',
              borderRadius: 12,
              boxShadow: '0 2px 8px #bae6fd55',
              padding: '18px 20px',
              marginBottom: 10,
              fontSize: 16,
              color: '#0369a1',
              fontWeight: 600
            }}>
              {step.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
