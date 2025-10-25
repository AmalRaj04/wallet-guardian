"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "gradient"
  | "ghost"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface EnhancedButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  glow?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      glow = false,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none relative overflow-hidden",
      fullWidth && "w-full"
    );

    const variantStyles = {
      primary: cn(
        "bg-neon-blue text-white hover:bg-neon-blue/90 focus-visible:ring-neon-blue",
        glow && "shadow-glow-cyan hover:shadow-glow-cyan"
      ),
      secondary: cn(
        "glass-effect text-white hover:bg-white/10 focus-visible:ring-neon-purple"
      ),
      gradient: cn(
        "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white font-semibold hover:opacity-90 focus-visible:ring-neon-purple",
        glow && "shadow-glow-purple hover:shadow-glow-purple"
      ),
      ghost: cn(
        "bg-transparent text-gray-300 hover:bg-white/5 focus-visible:ring-gray-400"
      ),
      danger: cn(
        "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
        glow && "shadow-[0_0_20px_rgba(239,68,68,0.4)]"
      ),
      success: cn(
        "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500",
        glow && "shadow-glow-green"
      ),
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      xl: "px-8 py-4 text-xl",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        onClick={onClick as any}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span className="relative z-10">{children}</span>
        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {variant === "gradient" && !disabled && !loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
        )}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";
export default EnhancedButton;
