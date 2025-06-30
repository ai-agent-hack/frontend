"use client";

import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  targetSelector?: string;
  actionButtons?: {
    label: string;
    action: () => void;
    variant?: "solid" | "outline";
  }[];
}

interface TutorialPopoverProps {
  steps: TutorialStep[];
  currentStep: number;
  isOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSkip: () => void;
  targetElement?: HTMLElement | null;
}

export default function TutorialPopover({
  steps,
  currentStep,
  isOpen,
  onNext,
  onPrev,
  onSkip,
  targetElement,
}: TutorialPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (currentStepData?.targetSelector) {
      const element = document.querySelector(
        currentStepData.targetSelector,
      ) as HTMLElement;
      setAnchorEl(element);
    } else if (targetElement) {
      setAnchorEl(targetElement);
    }
  }, [currentStepData, targetElement]);

  useEffect(() => {
    if (anchorEl && isOpen) {
      const updatePosition = () => {
        const rect = anchorEl.getBoundingClientRect();
        const popoverWidth = 320;
        const popoverHeight = 200;
        const arrowSize = 10;

        let top = rect.top;
        let left = rect.left;

        switch (currentStepData?.position) {
          case "top":
            top = rect.top - popoverHeight - arrowSize - 5;
            left = rect.left + rect.width / 2 - popoverWidth / 2;
            break;
          case "bottom":
            top = rect.bottom + arrowSize + 5;
            left = rect.left + rect.width / 2 - popoverWidth / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2 - popoverHeight / 2;
            left = rect.left - popoverWidth - arrowSize - 5;
            break;
          case "right":
            top = rect.top + rect.height / 2 - popoverHeight / 2;
            left = rect.right + arrowSize + 5;
            break;
          default:
            top = rect.bottom + arrowSize + 5;
            left = rect.left + rect.width / 2 - popoverWidth / 2;
        }

        // Keep popover within viewport
        if (left < 10) left = 10;
        if (left + popoverWidth > window.innerWidth - 10) {
          left = window.innerWidth - popoverWidth - 10;
        }
        if (top < 10) top = 10;
        if (top + popoverHeight > window.innerHeight - 10) {
          top = window.innerHeight - popoverHeight - 10;
        }

        setPosition({ top, left });
      };

      updatePosition();

      // Add resize listener for responsive behavior
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [anchorEl, isOpen, currentStepData]);

  if (!currentStepData || !anchorEl || !isOpen) {
    return null;
  }

  const getArrowStyles = () => {
    const arrowSize = 10;
    const borderSize = arrowSize + 1;

    switch (currentStepData?.position) {
      case "top":
        return {
          arrow: {
            position: "absolute" as const,
            bottom: `-${arrowSize}px`,
            left: "50%",
            marginLeft: `-${arrowSize}px`,
            width: 0,
            height: 0,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderTop: `${arrowSize}px solid white`,
          },
          arrowBorder: {
            position: "absolute" as const,
            bottom: `-${borderSize}px`,
            left: "50%",
            marginLeft: `-${borderSize}px`,
            width: 0,
            height: 0,
            borderLeft: `${borderSize}px solid transparent`,
            borderRight: `${borderSize}px solid transparent`,
            borderTop: `${borderSize}px solid #e2e8f0`,
          },
        };
      case "bottom":
        return {
          arrow: {
            position: "absolute" as const,
            top: `-${arrowSize}px`,
            left: "50%",
            marginLeft: `-${arrowSize}px`,
            width: 0,
            height: 0,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid white`,
          },
          arrowBorder: {
            position: "absolute" as const,
            top: `-${borderSize}px`,
            left: "50%",
            marginLeft: `-${borderSize}px`,
            width: 0,
            height: 0,
            borderLeft: `${borderSize}px solid transparent`,
            borderRight: `${borderSize}px solid transparent`,
            borderBottom: `${borderSize}px solid #e2e8f0`,
          },
        };
      case "left":
        return {
          arrow: {
            position: "absolute" as const,
            right: `-${arrowSize}px`,
            top: "50%",
            marginTop: `-${arrowSize}px`,
            width: 0,
            height: 0,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderLeft: `${arrowSize}px solid white`,
          },
          arrowBorder: {
            position: "absolute" as const,
            right: `-${borderSize}px`,
            top: "50%",
            marginTop: `-${borderSize}px`,
            width: 0,
            height: 0,
            borderTop: `${borderSize}px solid transparent`,
            borderBottom: `${borderSize}px solid transparent`,
            borderLeft: `${borderSize}px solid #e2e8f0`,
          },
        };
      case "right":
        return {
          arrow: {
            position: "absolute" as const,
            left: `-${arrowSize}px`,
            top: "50%",
            marginTop: `-${arrowSize}px`,
            width: 0,
            height: 0,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid white`,
          },
          arrowBorder: {
            position: "absolute" as const,
            left: `-${borderSize}px`,
            top: "50%",
            marginTop: `-${borderSize}px`,
            width: 0,
            height: 0,
            borderTop: `${borderSize}px solid transparent`,
            borderBottom: `${borderSize}px solid transparent`,
            borderRight: `${borderSize}px solid #e2e8f0`,
          },
        };
      default:
        return { arrow: {}, arrowBorder: {} };
    }
  };

  const arrowStyles = getArrowStyles();

  const popoverContent = (
    <Box
      position="fixed"
      top={`${position.top}px`}
      left={`${position.left}px`}
      zIndex={9999}
      maxW="320px"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      shadow="0px 5px 20px rgba(0, 0, 0, 0.3)"
      borderRadius="xl"
      p={4}
    >
      {/* Arrow border */}
      <Box style={arrowStyles.arrowBorder} />
      {/* Arrow */}
      <Box style={arrowStyles.arrow} />
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start">
          <Text fontWeight="bold" fontSize="md" color={"black"} flex="1">
            {currentStepData.title}
          </Text>
        </HStack>

        <Text fontSize="sm" color="gray.700" lineHeight="1.5">
          {currentStepData.content}
        </Text>

        {currentStepData.actionButtons && (
          <VStack gap={2}>
            {currentStepData.actionButtons.map((button, index) => (
              <Button
                key={`action-${button.label}-${index}`}
                size="sm"
                variant={button.variant || "solid"}
                colorScheme="purple"
                onClick={button.action}
                width="100%"
              >
                {button.label}
              </Button>
            ))}
          </VStack>
        )}

        <HStack justify="space-between" pt={2}>
          <Text fontSize="xs" color={"gray"}>
            {currentStep + 1} / {steps.length}
          </Text>
          <HStack gap={2}>
            <Button size="xs" color={"orange"} onClick={onSkip}>
              スキップ
            </Button>
            {!isFirstStep && (
              <Button size="xs" color={"gray"} onClick={onPrev}>
                戻る
              </Button>
            )}
            <Button
              size="xs"
              color={"black"}
              onClick={onNext}
              disabled={isLastStep}
            >
              {isLastStep ? "完了" : "次へ"}
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );

  return createPortal(popoverContent, document.body);
}
