"use client";

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";
import { forwardRef } from "react";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox(
    { checked, onCheckedChange, children, size = "md", ...props },
    ref,
  ) {
    return (
      <ChakraCheckbox.Root
        ref={ref}
        checked={checked}
        onCheckedChange={(details) => onCheckedChange?.(details.checked)}
        size={size}
        {...props}
      >
        <ChakraCheckbox.HiddenInput />
        <ChakraCheckbox.Control>
          <ChakraCheckbox.Indicator />
        </ChakraCheckbox.Control>
        {children && <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>}
      </ChakraCheckbox.Root>
    );
  },
);

Checkbox.displayName = "Checkbox";
