import { JSX } from "react"

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
} as const

function classes(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ")
}

export type ButtonVariant = keyof typeof variantClasses
export type ButtonSize = keyof typeof sizeClasses

export interface ButtonProps
  extends Omit<JSX.IntrinsicElements["button"], "ref"> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Optional helper to mirror the old `buttonVariants` API without `cva`. */
export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return classes(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classes(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
}
