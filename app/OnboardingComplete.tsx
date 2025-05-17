import React from "react";

interface OnboardingCompleteProps {
  user: { email: string };
  onLogoutAction: () => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ user, onLogoutAction }) => {
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
          <button className="flex items-center gap-2 text-left hover:underline cursor-default" disabled>
            <span className="inline-block w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold">✓</span>
            <span>Non-Disclosure Agreement (NDA)</span>
          </button>
          <button className="flex items-center gap-2 text-left hover:underline cursor-default" disabled>
            <span className="inline-block w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold">✓</span>
            <span>Medical Waiver</span>
          </button>
          <div className="mt-4 text-center text-cyan-700 font-medium">
            You are now fully onboarded and logged in!<br />Thank you for signing all required agreements.
          </div>
        </div>
      </div>
      <button
        onClick={onLogoutAction}
        className="px-8 py-4 rounded-full font-bold text-lg bg-white text-blue-500 shadow-xl transition-all duration-200 mt-10 mb-10 border-2 border-blue-400 hover:bg-blue-50"
        style={{ textShadow: "0 0 10px #00bfff, 0 0 20px #00bfff", boxShadow: "0 0 24px 4px #00bfff, 0 0 32px 8px #00bfff99" }}
      >
        Logout
      </button>
    </div>
  );
};

export default OnboardingComplete;
