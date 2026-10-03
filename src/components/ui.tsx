import { type Country, type Currency, type GameType, FLAG_EMOJI, GAME_META, getInitials, formatCurrency } from '../data';

// ─── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({
  name,
  country,
  color,
  size = 'md',
  className = '',
}: {
  name: string;
  country: Country;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = { sm: 32, md: 40, lg: 56, xl: 80 };
  const px = sizes[size];
  const fontSize = { sm: 11, md: 14, lg: 18, xl: 26 }[size];
  const flagSize = { sm: 12, md: 14, lg: 18, xl: 24 }[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} style={{ width: px, height: px }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold select-none"
        style={{ background: color, fontFamily: 'Chakra Petch, sans-serif', fontSize }}
      >
        {getInitials(name)}
      </div>
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border border-white leading-none flex items-center justify-center"
        style={{ fontSize: flagSize, width: flagSize + 4, height: flagSize + 4, background: '#fff' }}
      >
        {FLAG_EMOJI[country]}
      </span>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'won' | 'lost' | 'pending' | 'disputed' | 'live' | 'verified' | 'cancelled' | 'completed';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  won: 'bg-green-100 text-green-700 border-green-200',
  verified: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-600 border-red-200',
  disputed: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  live: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function Badge({ variant, children, className = '' }: { variant: BadgeVariant; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${BADGE_STYLES[variant]} ${className}`}
      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
      {variant === 'live' && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
      )}
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-green-600 hover:bg-green-700 text-white glow-green',
  secondary: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  children,
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all duration-150 select-none cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
        ${BTN_VARIANTS[variant]}
        ${BTN_SIZES[size]}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ fontFamily: 'Chakra Petch, sans-serif' }}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  prefix,
  suffix,
  className = '',
  autoComplete,
  inputMode,
  name,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  name?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </label>
      )}
      <div className={`flex items-center rounded-lg border transition-colors
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
        focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500
      `}>
        {prefix && <div className="pl-3 pr-2 text-gray-500 shrink-0">{prefix}</div>}
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        {suffix && <div className="pl-2 pr-3 text-gray-500 shrink-0">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-red-500" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── PhoneInput ──────────────────────────────────────────────────────────────
export function PhoneInput({
  value,
  onChange,
  country,
  onCountryChange,
}: {
  value: string;
  onChange: (v: string) => void;
  country: Country;
  onCountryChange: (c: Country) => void;
}) {
  const dialCode = country === 'GH' ? '+233' : '+234';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
        Phone Number
      </label>
      <div className="flex rounded-lg border border-gray-200 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors overflow-hidden">
        <button
          onClick={() => onCountryChange(country === 'GH' ? 'NG' : 'GH')}
          className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0"
          type="button"
        >
          <span className="text-base">{FLAG_EMOJI[country]}</span>
          <span className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{dialCode}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <input
          type="tel"
          autoComplete="tel-national"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="20 000 0000"
          className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>
    </div>
  );
}

// ─── GameBadge ───────────────────────────────────────────────────────────────
export function GameBadge({ game, size = 'sm' }: { game: GameType; size?: 'sm' | 'md' }) {
  const meta = GAME_META[game];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center font-bold rounded ${pad}`}
      style={{ background: meta.bg, color: meta.color, fontFamily: 'Chakra Petch, sans-serif', letterSpacing: '0.04em' }}
    >
      {game}
    </span>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  subtext,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  accent?: boolean;
}) {
  const isPositive = trend?.startsWith('+');
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p className={`text-2xl font-bold tabular ${accent ? 'text-green-600' : 'text-gray-900'}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
        {value}
      </p>
      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {trend}
            </span>
          )}
          {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
      )}
    </Card>
  );
}

// ─── AmountDisplay ───────────────────────────────────────────────────────────
export function AmountDisplay({ amount, currency, size = 'base' }: { amount: number; currency: Currency; size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' }) {
  const textClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }[size];
  return (
    <span className={`font-bold tabular ${textClass} text-gray-900`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

// ─── Icon components (1.5px stroke, geometric) ───────────────────────────────
export function IconWallet({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="5" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 9H18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 2L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14.5" cy="13.5" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function IconGamepad({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="6" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10H9M8 9V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12.5" cy="10" r="0.75" fill="currentColor"/>
      <circle cx="14" cy="11.5" r="0.75" fill="currentColor"/>
    </svg>
  );
}

export function IconTrophy({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 14v2M7 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 4H3a1 1 0 00-1 1v1a4 4 0 004 4h0M16 4h1a1 1 0 011 1v1a4 4 0 01-4 4h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 2h10v8a5 5 0 01-10 0V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconBell({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 2a6 6 0 016 6v3l1.5 2.5H2.5L4 11V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSettings({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M15.78 4.22l-1.42 1.42M5.64 14.36l-1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconShield({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 2l7 3v5c0 4-3.5 7-7 8C6.5 17 3 14 3 10V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowRight({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconUpload({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 13V3M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCheck({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconX({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLink({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6.5 9.5L9.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 11l-1.5 1.5a3 3 0 01-4.243-4.243L3.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5l1.5-1.5a3 3 0 014.243 4.243L12.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronRight({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconAlertTriangle({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 9v4M10 15v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSearch({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconFilter({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMobile({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBank({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 17h14M3 9h14M10 3L3 7h14L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 9v8M10 9v8M15 9v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconUser({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconFlag({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 3v14M4 3h12l-3 5 3 5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconLogout({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M13 16h4V4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 13l3-3-3-3M3 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconGrid({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function IconList({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClock({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
