"use client"

import { useState, useEffect } from "react"

interface OnboardingModalProps {
  user: { email: string }
  supabase: any
  onLogoutAction: () => void
  onOnboardingComplete?: () => void
}

export default function OnboardingModal({ user, supabase, onLogoutAction, onOnboardingComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [eligibility, setEligibility] = useState({
    over18: false,
    noMedication: false,
    noPsychHistory: false,
  })
  const [ndaSigned, setNdaSigned] = useState(false)
  const [waiverSigned, setWaiverSigned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNDA, setShowNDA] = useState(false)
  const [showWaiver, setShowWaiver] = useState(false)

  // Fetch onboarding state from Supabase
  const fetchStatus = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("test_user_profiles")
      .select("*")
      .eq("email", user.email)
      .single()
    if (data) {
      setEligibility({
        over18: !!data.over18,
        noMedication: !!data.noMedication,
        noPsychHistory: !!data.noPsychHistory,
      })
      setNdaSigned(!!data.nda_signed)
      setWaiverSigned(!!data.medical_waiver_signed)
      // Show summary if all complete
      if (data.over18 && data.noMedication && data.noPsychHistory && data.nda_signed && data.medical_waiver_signed) {
        setStep(3)
        if (typeof onOnboardingComplete === 'function') {
          onOnboardingComplete();
        }
      } else if (data.nda_signed) {
        setStep(2)
      } else if (data.over18 && data.noMedication && data.noPsychHistory) {
        setStep(1)
      } else {
        setStep(0)
      }
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, [user.email]);

  // Update Supabase on step completion
  async function updateProfile(fields: any) {
    await supabase.from("test_user_profiles").update(fields).eq("email", user.email)
  }

  // Stepper content
  const steps = [
    {
      title: "Eligibility Checklist",
      content: (
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-white/90 font-medium text-base cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.over18}
              onChange={(e) => setEligibility({ ...eligibility, over18: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <span>I confirm I am over 18 years old</span>
          </label>
          <label className="flex items-center gap-3 text-white/90 font-medium text-base cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.noMedication}
              onChange={(e) => setEligibility({ ...eligibility, noMedication: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <span>I confirm I am not currently taking any medication</span>
          </label>
          <label className="flex items-center gap-3 text-white/90 font-medium text-base cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.noPsychHistory}
              onChange={(e) => setEligibility({ ...eligibility, noPsychHistory: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <span>I confirm I have no psychiatric history</span>
          </label>
          <button
            className={`mt-6 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-200 ${
              Object.values(eligibility).every(Boolean)
                ? "hover:from-cyan-400 hover:to-blue-400"
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!Object.values(eligibility).every(Boolean)}
            onClick={() => setStep(1)}
          >
            Continue
          </button>
        </div>
      ),
    },
    {
      title: "Non-Disclosure Agreement (NDA)",
      content: (
        <div className="flex flex-col gap-4">
          <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-h-[280px] overflow-y-auto text-white/80 text-sm">
            <h3 className="text-cyan-300 font-semibold mb-3">NON-DISCLOSURE AND NON-CIRCUMVENTION AGREEMENT</h3>

            <div className="space-y-2">
              {/* Accordion sections */}
              {[
                {
                  title: "Purpose & Parties",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>This Agreement is entered into on 15 May 2025, between:</p>
                      <p className="mt-1">
                        1. <strong>Integrated Business Care, TRADING AS The Water Bar License</strong> (the "Disclosing
                        Party")
                      </p>
                      <p>2. The user signing up for the hydration coaching program (the "Receiving Party")</p>
                      <p className="mt-1">
                        The purpose is to protect confidential information disclosed during the hydration coaching
                        program.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Confidential Information",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>Includes but is not limited to:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Business and financial information</li>
                        <li>Personal information of clients and employees</li>
                        <li>Intellectual property and proprietary data</li>
                        <li>Business plans and strategies</li>
                        <li>Event management concepts and operational plans</li>
                        <li>Supplier and vendor lists</li>
                        <li>Marketing and branding methodologies</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  title: "Obligations",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>The Receiving Party agrees to:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Keep all confidential information strictly confidential</li>
                        <li>Comply with all data protection and privacy laws</li>
                        <li>Use the information solely for the purposes outlined</li>
                        <li>Employ reasonable measures to safeguard the information</li>
                        <li>Limit access to those who require it</li>
                        <li>Immediately notify of any unauthorized disclosure</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  title: "Non-Circumvention",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>The Receiving Party agrees:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>
                          Not to contact, solicit, or engage with the Disclosing Party's clients, vendors, or employees
                          for 36 months
                        </li>
                        <li>Not to engage with the Disclosing Party's suppliers or contractors for 24 months</li>
                        <li>
                          To refrain from disclosing information about the Disclosing Party's relationships to third
                          parties
                        </li>
                      </ul>
                    </div>
                  ),
                },
                {
                  title: "Duration & Governing Law",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>This Agreement:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Commences upon execution</li>
                        <li>Remains in effect during the relationship and for 2 years following termination</li>
                        <li>Is governed by the laws of the United Arab Emirates</li>
                        <li>Any disputes are subject to the exclusive jurisdiction of UAE courts</li>
                      </ul>
                    </div>
                  ),
                },
              ].map((section, index) => (
                <div key={index} className="border-b border-white/10 pb-2">
                  <details className="group">
  <summary className="flex items-center gap-2 cursor-pointer py-2 text-cyan-700 font-semibold">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32" height="32"
      className="h-8 w-8 mr-2 flex-shrink-0 transition-transform group-open:rotate-180 text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    {section.title}
  </summary>
  <div className="mt-2 pl-2 pr-1 pb-2 bg-white/95 rounded text-gray-800 shadow-inner border border-cyan-100">{section.content}</div>
</details>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-200 ${
              ndaSigned ? "opacity-50 cursor-not-allowed" : "hover:from-cyan-400 hover:to-blue-400"
            }`}
            disabled={ndaSigned}
            onClick={async () => {
  await updateProfile({ nda_signed: true });
  setNdaSigned(true);
  fetchStatus();
}}
          >
            I Agree
          </button>

          {ndaSigned && (
            <button
              className="mt-2 w-full py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 font-medium transition-all duration-200"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          )}
        </div>
      ),
    },
    {
      title: "Medical Waiver",
      content: (
        <div className="flex flex-col gap-4">
          <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-h-[280px] overflow-y-auto text-white/80 text-sm">
            <h3 className="text-cyan-300 font-semibold mb-3">MEDICAL DISCLAIMER & WAIVER</h3>

            <div className="space-y-2">
              {/* Accordion sections */}
              {[
                {
                  title: "Parties & Purpose",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>This Agreement is entered into on 15 May 2025, between:</p>
                      <p className="mt-1">
                        1. <strong>Integrated Business Care, TRADING AS The Water Bar License</strong> (the "Disclosing
                        Party")
                      </p>
                      <p>2. The user signing up for the hydration coaching program (the "Receiving Party")</p>
                      <p className="mt-1">
                        By using our hydration coaching system "The Water Bar Hydration Tracker App" during this trial,
                        you acknowledge and agree to the following terms.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Not Medical Advice",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>
                        The Water Bar and its associated content, features, coaching, and recommendations are intended
                        solely for general wellness and educational purposes. The information provided through the app,
                        including hydration tracking, observations, and coaching suggestions, is not intended as a
                        substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "No Clinical Claims",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>
                        We do not conduct clinical studies or offer medical or therapeutic services. The coaching and
                        insights offered are based on user input, general hydration principles, and behavioral wellness
                        practices. We do not make any claims regarding healing, curing, or preventing any medical
                        conditions.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Consult Your Physician",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>
                        Always seek the advice of your physician or other qualified health provider with any questions
                        you may have regarding a medical condition or your personal health. Never disregard professional
                        medical advice or delay in seeking it because of something you have read or received through The
                        Water Bar.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Voluntary Participation",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>
                        Your use of The Water Bar is voluntary, and you understand that any changes to your hydration or
                        wellness habits should be considered in conjunction with your overall health plan and personal
                        needs.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Limitation of Liability",
                  content: (
                    <div className="text-xs text-white/70">
                      <p>
                        The Water Bar, its affiliates, and representatives disclaim any liability for decisions or
                        actions you take based on the information provided. Your reliance on any information provided by
                        The Water Bar is solely at your own risk.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Miscellaneous",
                  content: (
                    <div className="text-xs text-white/70">
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>
                          <strong>Binding Effect:</strong> This Agreement is binding upon and ensures to the benefit of
                          the Parties and their respective heirs, successors, and assigns.
                        </li>
                        <li>
                          <strong>Amendments:</strong> Any modifications to this Agreement must be made in writing and
                          signed by both Parties.
                        </li>
                        <li>
                          <strong>Severability:</strong> If any provision of this Agreement is found to be
                          unenforceable, the remaining provisions shall remain in full effect.
                        </li>
                        <li>
                          <strong>Force Majeure:</strong> Neither Party shall be held liable for delays or failures due
                          to events beyond their reasonable control.
                        </li>
                      </ul>
                    </div>
                  ),
                },
              ].map((section, index) => (
                <div key={index} className="border-b border-white/10 pb-2">
                  <details className="group">
  <summary className="flex items-center gap-2 cursor-pointer py-2 text-cyan-700 font-semibold">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32" height="32"
      className="h-8 w-8 mr-2 flex-shrink-0 transition-transform group-open:rotate-180 text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    {section.title}
  </summary>
  <div className="mt-2 pl-2 pr-1 pb-2 bg-white/95 rounded text-gray-800 shadow-inner border border-cyan-100">{section.content}</div>
</details>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-200 ${
              waiverSigned ? "opacity-50 cursor-not-allowed" : "hover:from-cyan-400 hover:to-blue-400"
            }`}
            disabled={waiverSigned}
            onClick={async () => {
  await updateProfile({ medical_waiver_signed: true });
  setWaiverSigned(true);
  fetchStatus();
}}
          >
            I Agree
          </button>

          {waiverSigned && (
            <button
              className="mt-2 w-full py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 font-medium transition-all duration-200"
              onClick={onLogoutAction}
            >
              Finish
            </button>
          )}
        </div>
      ),
    },
  ]

  if (loading) return <div className="text-cyan-600 font-semibold text-lg">Loading onboarding…</div>

  // Step 3: Summary/status view
  if (step === 3) {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-2xl text-cyan-800 font-bold mb-4">Welcome, {user.email}!</div>
        <div className="bg-white/70 rounded-2xl shadow-lg p-8 w-full max-w-xl flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-cyan-700 mb-2">Onboarding Complete</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold">✓</span>
              <span>Pre-questions checklist</span>
            </div>
            <button onClick={() => setShowNDA((v) => !v)} className="flex items-center gap-2 text-left hover:underline">
              <span className={`inline-block w-5 h-5 rounded-full ${ndaSigned ? 'bg-cyan-400' : 'bg-gray-300'} flex items-center justify-center text-white font-bold`}>✓</span>
              <span>Non-Disclosure Agreement (NDA)</span>
            </button>
            {showNDA && (
              <div className="bg-white/90 border border-cyan-200 rounded-lg p-4 text-sm mt-2"><b>NON-DISCLOSURE AND NON-CIRCUMVENTION AGREEMENT</b> ... [full NDA content here]</div>
            )}
            <button onClick={() => setShowWaiver((v) => !v)} className="flex items-center gap-2 text-left hover:underline">
              <span className={`inline-block w-5 h-5 rounded-full ${waiverSigned ? 'bg-cyan-400' : 'bg-gray-300'} flex items-center justify-center text-white font-bold`}>✓</span>
              <span>Medical Waiver</span>
            </button>
            {showWaiver && (
              <div className="bg-white/90 border border-cyan-200 rounded-lg p-4 text-sm mt-2"><b>MEDICAL DISCLAIMER & WAIVER</b> ... [full waiver content here]</div>
            )}
          </div>
        </div>
        <button onClick={onLogout} className="px-8 py-4 rounded-full font-bold text-lg bg-white text-blue-500 shadow-xl transition-all duration-200 mt-10 mb-10 border-2 border-blue-400 hover:bg-blue-50" style={{ textShadow: "0 0 10px #00bfff, 0 0 20px #00bfff", boxShadow: "0 0 24px 4px #00bfff, 0 0 32px 8px #00bfff99" }}>Logout</button>
      </div>
    );
  }

  // Stepper UI (steps 0-2)
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Progress bar */}
      <div className="h-1 bg-slate-700 flex w-full max-w-xl mb-4 rounded-lg overflow-hidden">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-full transition-all duration-300 ${i <= step ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-slate-700"}`}
            style={{ width: `${100 / steps.length}%` }}
          />
        ))}
      </div>
      <div className="bg-white/80 rounded-2xl shadow-lg p-8 w-full max-w-xl flex flex-col gap-6 items-center">
        <h2 className="text-xl font-bold text-cyan-700 mb-2">{steps[step].title}</h2>
        {steps[step].content}
      </div>
    </div>
  )
}
