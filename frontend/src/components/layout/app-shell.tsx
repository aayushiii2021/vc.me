import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('flex min-h-svh flex-col bg-background', className)}>
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground"
          >
            Y
          </div>
          <span className="text-sm font-semibold tracking-tight">vc.me</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
