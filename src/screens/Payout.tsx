import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  IconMobile,
  IconBank,
  IconCheck,
  IconArrowRight,
} from '../components/ui';
import { me } from '../data';


type Method = 'mobile' | 'bank' | null;
type MobileNetwork = 'mtn' | 'telecel' | 'airteltigo';

const MOBILE_NETWORKS = {
  GH: [
    { id: 'mtn' as MobileNetwork, label: 'MTN Mobile Money' },
    { id: 'telecel' as MobileNetwork, label: 'Telecel Cash' },
    { id: 'airteltigo' as MobileNetwork, label: 'AirtelTigo Money' },
  ],
  NG: [
    { id: 'mtn' as MobileNetwork, label: 'MTN MoMo' },
    { id: 'telecel' as MobileNetwork, label: 'Airtel Money' },
    { id: 'airteltigo' as MobileNetwork, label: 'Glo Pay' },
  ],
};

const BANK_LABELS: Record<string, string> = {
  GH: 'All Ghana banks supported',
  NG: 'All Nigerian banks supported',
};

const CURRENCY_LABEL = me.currency;
const COUNTRY = me.country;
const WITHDRAWAL_FEE = 1;
const MIN_WITHDRAWAL = 20;

export default function Payout({ onNavigate, balance, onWithdraw }: { onNavigate: (s: string) => void; balance: number; onWithdraw: (amount: number) => void }) {
  const [method, setMethod] = useState<Method>(null);
  const [network, setNetwork] = useState<MobileNetwork>('mtn');
  const [phone, setPhone] = useState(me.phone.replace(/^\+\d+\s/, ''));
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [txId] = useState(() => `PRV-${COUNTRY}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`);

  const networks = MOBILE_NETWORKS[COUNTRY];
  const selectedNetwork = networks.find(n => n.id === network);

  const amountNum = parseFloat(amount) || 0;
  const belowMin = amountNum > 0 && amountNum < MIN_WITHDRAWAL;
  const overBalance = amountNum > balance;
  const receive = Math.max(0, amountNum - WITHDRAWAL_FEE);
  const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const canWithdraw = amountNum >= MIN_WITHDRAWAL && !overBalance;

  function handleWithdraw() {
    if (!canWithdraw) return;
    onWithdraw(amountNum);
    setShowSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Withdraw Funds
        </h1>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* Balance Display */}
        <div className="bg-gray-900 rounded-[24px] p-6 text-white relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-green-500/20 blur-2xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Available Balance</p>
          <p className="relative text-4xl font-black text-green-400 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {CURRENCY_LABEL} {money(balance)}
          </p>
          <p className="relative text-xs text-gray-400 mt-2">Winnings land here after every verified win. Choose how you want to cash out below.</p>
        </div>

        {/* Method Selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Withdrawal Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Mobile Money */}
            <button
              onClick={() => setMethod('mobile')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                method === 'mobile'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                method === 'mobile' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <IconMobile size={20} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Mobile Money
                  </p>
                  {method === 'mobile' && (
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <IconCheck size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {COUNTRY === 'GH' ? 'MTN, Vodafone (Telecel), AirtelTigo' : 'MTN, Airtel, Glo, 9mobile'}
                </p>
              </div>
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setMethod('bank')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                method === 'bank'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                method === 'bank' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <IconBank size={20} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Bank Transfer
                  </p>
                  {method === 'bank' && (
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <IconCheck size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {BANK_LABELS[COUNTRY]}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  1–3 business days
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Money Form */}
        {method === 'mobile' && (
          <Card className="p-4 flex flex-col gap-4 animate-fade-up">
            {/* Network Selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Network
              </p>
              <div className="flex gap-2 flex-wrap">
                {networks.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setNetwork(n.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      network === n.id
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              prefix={
                <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {COUNTRY === 'GH' ? '+233' : '+234'}
                </span>
              }
            />

            <Input
              label={`Amount (${CURRENCY_LABEL})`}
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              prefix={
                <span className="text-sm font-semibold text-gray-700 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {CURRENCY_LABEL}
                </span>
              }
            />

            <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Withdrawal fee: <span className="font-semibold text-gray-600">{CURRENCY_LABEL} {WITHDRAWAL_FEE.toFixed(2)}</span> · Minimum: <span className="font-semibold text-gray-600">{CURRENCY_LABEL} {MIN_WITHDRAWAL}</span>
            </p>
            {belowMin && (
              <p className="text-xs text-red-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Minimum withdrawal is {CURRENCY_LABEL} {MIN_WITHDRAWAL}.
              </p>
            )}
          </Card>
        )}

        {/* Bank Transfer Form */}
        {method === 'bank' && (
          <Card className="p-4 flex flex-col gap-4 animate-fade-up">
            <Input
              label="Bank Name"
              value={bankName}
              onChange={setBankName}
              placeholder="Select your bank"
            />
            <Input
              label="Account Number"
              value={accountNumber}
              onChange={setAccountNumber}
              placeholder="0000000000"
              type="number"
            />
            <Input
              label="Account Name"
              value={me.name}
              onChange={() => {}}
              suffix={
                <span className="text-xs text-green-600 font-semibold">Auto-filled</span>
              }
            />
            <Input
              label={`Amount (${CURRENCY_LABEL})`}
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              prefix={
                <span className="text-sm font-semibold text-gray-700 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {CURRENCY_LABEL}
                </span>
              }
            />
            <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Withdrawal fee: <span className="font-semibold text-gray-600">{CURRENCY_LABEL} {WITHDRAWAL_FEE.toFixed(2)}</span> · Minimum: <span className="font-semibold text-gray-600">{CURRENCY_LABEL} {MIN_WITHDRAWAL}</span>
            </p>
            {belowMin && (
              <p className="text-xs text-red-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Minimum withdrawal is {CURRENCY_LABEL} {MIN_WITHDRAWAL}.
              </p>
            )}
          </Card>
        )}

        {method && (
          <Card className="p-4 flex flex-col gap-3 animate-fade-up">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick amount</p>
              <div className="flex gap-2">
                {[{ l: '25%', p: 0.25 }, { l: '50%', p: 0.5 }, { l: 'Max', p: 1 }].map(q => (
                  <button
                    key={q.l}
                    onClick={() => setAmount(String(Math.floor(balance * q.p)))}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    {q.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Withdrawing</span><span className="font-bold text-gray-900">{CURRENCY_LABEL} {money(amountNum)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Withdrawal fee</span><span className="font-bold text-gray-900">- {CURRENCY_LABEL} {money(amountNum > 0 ? WITHDRAWAL_FEE : 0)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="font-bold text-gray-900">You receive</span><span className="font-black text-green-600">{CURRENCY_LABEL} {money(receive)}</span></div>
            </div>
            {overBalance && (
              <p className="text-xs text-red-500">That's more than your available balance.</p>
            )}
          </Card>
        )}

        {/* Withdraw Button */}
        {method && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="glow-green animate-fade-up"
            onClick={handleWithdraw}
            disabled={!amount}
          >
            Withdraw Funds
            <IconArrowRight size={16} />
          </Button>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-fade-up shadow-2xl">
            {/* Checkmark */}
            <div
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
              style={{ animation: 'fade-up 0.4s ease-out forwards' }}
            >
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center glow-green">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5.5 5.5L22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="text-center flex flex-col gap-1">
              <h2
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                Withdrawal Initiated!
              </h2>
              <p
                className="text-4xl font-bold text-green-600 tabular mt-1"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {CURRENCY_LABEL} {amount ? parseFloat(amount).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                To:{' '}
                <span className="font-medium text-gray-700">
                  {method === 'mobile'
                    ? `${selectedNetwork?.label} •• ${phone.slice(-4)}`
                    : `Bank Transfer — ${bankName || 'Selected Bank'}`}
                </span>
              </p>
            </div>

            {/* Transaction ID */}
            <div className="w-full bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Transaction ID
                </p>
                <p
                  className="text-xs font-semibold text-gray-700"
                  style={{ fontFamily: 'monospace' }}
                >
                  {txId}
                </p>
              </div>
              <button
                className="text-green-600 text-xs font-semibold hover:text-green-700 shrink-0"
                onClick={() => navigator.clipboard?.writeText(txId)}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Copy
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-green-500 shrink-0">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Arrives within 5 minutes
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onNavigate('dashboard')}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
