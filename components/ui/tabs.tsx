"use client"

import * as React from "react"

// simple class combiner
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

type TabsContextValue = {
  value: string | undefined
  setValue: (v: string) => void
  idBase: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsCtx() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
  return ctx
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const idBase = React.useId()
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)

  const current = isControlled ? value : internal
  const setValue = (v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value: current, setValue, idBase }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> { }

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cx(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const { value: activeValue, setValue, idBase } = useTabsCtx()
    const active = activeValue === value
    const tabId = `${idBase}-tab-${value}`
    const panelId = `${idBase}-panel-${value}`

    return (
      <button
        ref={ref}
        id={tabId}
        role="tab"
        type="button"
        aria-selected={active}
        aria-controls={panelId}
        data-state={active ? "active" : "inactive"}
        onClick={(e) => {
          setValue(value)
          onClick?.(e)
        }}
        className={cx(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue, idBase } = useTabsCtx()
    const active = activeValue === value
    const tabId = `${idBase}-tab-${value}`
    const panelId = `${idBase}-panel-${value}`

    return (
      <div
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId}
        data-state={active ? "active" : "inactive"}
        hidden={!active}
        className={cx(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"
