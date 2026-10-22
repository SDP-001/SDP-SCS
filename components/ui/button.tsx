import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:brightness-110",
        navy:
          "bg-slate-900 text-white border border-slate-700/80 shadow-sm hover:bg-slate-800 hover:border-cyan-500/40",
        destructive:
          "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]",
        outline:
          "border border-slate-700/80 bg-slate-900/80 text-slate-200 shadow-sm hover:bg-slate-800 hover:text-white hover:border-cyan-500/40",
        secondary:
          "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700 hover:text-white",
        ghost:
          "hover:bg-slate-800/80 hover:text-white text-slate-300",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        success:
          "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]",
        warning:
          "bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]",
        cyber:
          "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base font-semibold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
