"use client";

import { useAppStore } from "@/store/useAppStore";

const STEPS = [
  { id: 1, title: "Upload Documents", desc: "Select files" },
  { id: 2, title: "Print Settings", desc: "Configuring layouts" },
  { id: 3, title: "Payment & Collect", desc: "Complete order" }
];

export default function Stepper() {
  const { currentStep } = useAppStore();

  return (
    <div className="stepper flex flex-col gap-0">
      {STEPS.map((step, index) => {
        // Assume currentStep maps to the index. If currentStep is 1, step 0 is completed, step 1 is active.
        const isActive = currentStep === index + 1; // if steps start at 1 for Upload
        const isCompleted = currentStep > index + 1;
        const isInactive = currentStep < index + 1;

        return (
          <div key={step.id} className={`step relative pb-6 last:pb-0 ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isInactive ? 'inactive' : ''}`}>
            {index < STEPS.length - 1 && (
              <div className={`step-line absolute left-[11px] top-[24px] bottom-0 w-[2px] ${isCompleted ? 'bg-green' : 'bg-border'}`} />
            )}
            
            <div className="flex gap-4">
              <div className={`step-indicator w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 box-border
                ${isCompleted ? 'bg-green text-white' : ''}
                ${isActive ? 'bg-accent text-white' : ''}
                ${isInactive ? 'bg-white border-2 border-border text-grey' : ''}
              `}>
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  step.id
                )}
              </div>
              
              <div className="step-content pt-0.5">
                <div className={`step-title text-sm font-semibold ${isInactive ? 'text-grey' : 'text-gd'}`}>{step.title}</div>
                <div className="step-desc text-xs font-light text-grey mt-1">{step.desc}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
