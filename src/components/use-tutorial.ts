"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorialStep } from "./tutorial-popover";

interface UseTutorialProps {
  steps: TutorialStep[];
  autoStart?: boolean;
  storageKey?: string;
}

export function useTutorial({
  steps,
  autoStart = false,
  storageKey = "tutorial-completed",
}: UseTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial was already completed
    if (storageKey) {
      const completed = localStorage.getItem(storageKey);
      if (completed === "true") {
        setIsCompleted(true);
        return;
      }
    }

    if (autoStart) {
      setIsOpen(true);
    }
  }, [autoStart, storageKey]);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    setIsCompleted(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      setIsOpen(false);
      setIsCompleted(true);
      if (storageKey) {
        localStorage.setItem(storageKey, "true");
      }
    }
  }, [currentStep, steps.length, storageKey]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
  }, []);

  const skipTutorial = useCallback(() => {
    setIsOpen(false);
    setIsCompleted(true);
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const resetTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsCompleted(false);
    setIsOpen(false);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    currentStep,
    isOpen,
    isCompleted,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
