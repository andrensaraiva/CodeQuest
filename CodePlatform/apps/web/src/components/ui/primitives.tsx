import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-[#35ff7a] text-[#07110b] shadow-[0_0_24px_rgba(53,255,122,0.2)] hover:bg-[#82ffa8]',
        variant === 'secondary' && 'border border-[#2c3b46] bg-[#121a23] text-[#effff4] hover:border-[#35ff7a]/70',
        variant === 'ghost' && 'text-[#9fb2a8] hover:bg-white/5 hover:text-white',
        variant === 'danger' && 'bg-[#ff477e] text-white hover:bg-[#ff6f99]',
        className,
      )}
      {...props}
    />
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-xl border border-white/10 bg-[#101720]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]', className)}>{children}</section>
}

export function Badge({ children, tone = 'green', className }: { children: ReactNode; tone?: 'green' | 'cyan' | 'purple' | 'yellow' | 'red' | 'gray'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold',
        tone === 'green' && 'border-[#35ff7a]/40 bg-[#35ff7a]/10 text-[#83ffa8]',
        tone === 'cyan' && 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200',
        tone === 'purple' && 'border-purple-300/40 bg-purple-400/10 text-purple-200',
        tone === 'yellow' && 'border-yellow-300/40 bg-yellow-400/10 text-yellow-200',
        tone === 'red' && 'border-pink-300/40 bg-pink-400/10 text-pink-200',
        tone === 'gray' && 'border-white/10 bg-white/5 text-slate-300',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-[#202b36]', className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-[#35ff7a] via-cyan-300 to-[#b968ff]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[#8aa09a]">{label}</p>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {detail && <p className="mt-1 text-sm text-[#9fb2a8]">{detail}</p>}
    </Card>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('min-h-11 w-full rounded-lg border border-white/10 bg-[#0a1118] px-3 text-sm text-white outline-none focus:border-[#35ff7a]', props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-28 w-full rounded-lg border border-white/10 bg-[#0a1118] px-3 py-3 text-sm text-white outline-none focus:border-[#35ff7a]', props.className)} />
}

export function Select(props: InputHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('min-h-11 w-full rounded-lg border border-white/10 bg-[#0a1118] px-3 text-sm text-white outline-none focus:border-[#35ff7a]', props.className)} />
}

export function LoadingState({ label = 'Loading quest data...' }: { label?: string }) {
  return <Card className="animate-pulse text-[#9fb2a8]">{label}</Card>
}

export function ErrorState({ message }: { message: string }) {
  return <Card className="border-pink-400/30 bg-pink-950/20 text-pink-100">{message}</Card>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#9fb2a8]">{description}</p>
    </Card>
  )
}
