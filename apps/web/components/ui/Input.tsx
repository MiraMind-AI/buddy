"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-teal-200 focus:ring-2 focus:ring-teal-200/25",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
