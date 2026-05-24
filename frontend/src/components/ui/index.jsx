import React from 'react';
import { Loader2 } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) => {
  const base = 'btn-' + variant;
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' };
  return (
    <button className={`${base} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
    <input className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`} {...props} />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeVariants = {
  default: 'bg-white/10 text-gray-300',
  brand: 'bg-brand-600/20 text-brand-300 border border-brand-500/30',
  green: 'bg-green-500/15 text-green-400 border border-green-500/30',
  red: 'bg-red-500/15 text-red-400 border border-red-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
};

export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`badge ${badgeVariants[variant]} ${className}`}>{children}</span>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <Loader2 className={`${sizes[size]} animate-spin text-brand-400 ${className}`} />;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = () => (
  <div className="glass p-6 space-y-3">
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', glow = false, ...props }) => (
  <div
    className={`glass p-6 transition-all duration-300 ${glow ? 'hover:shadow-glow-sm hover:border-brand-500/30' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ── Online indicator ──────────────────────────────────────────────────────────
export const OnlineDot = ({ online = false }) => (
  <span className="relative inline-flex">
    <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-400' : 'bg-gray-600'}`} />
    {online && (
      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
    )}
  </span>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ label, className = '' }) => (
  <div className={`relative flex items-center gap-3 ${className}`}>
    <div className="flex-1 h-px bg-white/[0.08]" />
    {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
    <div className="flex-1 h-px bg-white/[0.08]" />
  </div>
);
