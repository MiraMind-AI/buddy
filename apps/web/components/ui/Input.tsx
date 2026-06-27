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
        "h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-[#111411] outline-none transition placeholder:text-[#8a918b] focus:border-[#8dc9be] focus:ring-2 focus:ring-[#8dc9be]/25",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
