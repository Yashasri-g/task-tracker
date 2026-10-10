'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import {
  Compass,
  Sun,
  CheckSquare,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Welcome to Command Center',
    subtitle: 'Executive Work & Clarity',
    description: 'A single, clutter-free workspace designed for high-level executives and focused professionals to manage tasks, projects, and documents in light mode.',
    icon: Compass,
    badge: '1 of 4',
  },
  {
    step: 2,
    title: 'My Day & Progress',
    subtitle: 'Daily Target Focus',
    description: 'Track your daily target completions, overdue attention items, and pending follow-ups with zero mathematical clutter or false progress bars.',
    icon: Sun,
    badge: '2 of 4',
  },
  {
    step: 3,
    title: 'Task & Inbox Management',
    subtitle: 'Rapid Capture',
    description: 'Press shortcut "C" or Cmd+K anytime to capture new tasks into your Inbox. Organize deadlines by Project, Upcoming, or Waiting-For status.',
    icon: CheckSquare,
    badge: '3 of 4',
  },
  {
    step: 4,
    title: 'Notes & Documentation Hub',
    subtitle: 'Google Docs Style Canvas',
    description: 'Write specifications, meeting records, and scratchpad notes directly on a clean paper document canvas with DOCX and PDF export actions.',
    icon: FileText,
    badge: '4 of 4',
  },
];

export function ProductTourModal({ isOpen, onClose }: ProductTourModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stepData = TOUR_STEPS[currentStepIndex];
  const Icon = stepData.icon;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6 pt-2 pb-1">
        {/* Step Indicator Badge */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 tracking-wider uppercase">
            Step {stepData.badge}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Skip Tour
          </button>
        </div>

        {/* Step Content Graphic & Icon */}
        <div className="flex flex-col items-center text-center space-y-3 py-2">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-2xs">
            <Icon className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{stepData.title}</h3>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {stepData.subtitle}
            </p>
          </div>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
            {stepData.description}
          </p>
        </div>

        {/* Dots Progress Indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-6 bg-indigo-600'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="gap-1 text-slate-600 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 px-4"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" /> Get Started
              </>
            ) : (
              <>
                Next Step <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
