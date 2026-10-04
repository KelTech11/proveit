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
import { useProfile } from '../profile';
import { fromGhs } from '../currency';

type Method = 'mobile' | 'paystack' | null;
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

const MIN_DEPOSIT_GHS = 10;

const cleanAmount = (v: string) => {
  const s = v.replace(/[^\d.]/g, '');
  const [whole, ...rest] = s.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
};

export default function Deposit({ onNavigate, balance, onDeposit }: { onNavigate: (s: string) => void; balance: number; onDeposit: (amount: number) => void }) {
  const { profile: me } = useProfile();
  const CURRENCY_LABEL = me.currency;
  const COUNTRY = me.country;
  const MIN_DEPOSIT = fromGhs(MIN_DEPOSIT_GHS, CURRENCY_LABEL);
  const [method, setMethod] = useState<Method>(null);
  const [network, setNetwork] = useState<MobileNetwork>('mtn');
  const [phone, setPhone] = useState(me.phone.replace(/^\+\d+\s/, '').replace(/\D/g, '').replace(/^0+/, ''));
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [txId] = useState(() => `DEP-${COUNTRY}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`);

  const networks = MOBILE_NETWORKS[COUNTRY];
  const selectedNetwork = networks.find(n => n.id === network);

  const amountNum = parseFloat(amount) || 0;
  const belowMin = amountNum > 0 && amountNum < MIN_DEPOSIT;
  const phoneLen = COUNTRY === 'GH' ? 9 : 10;
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === phoneLen && (COUNTRY === 'GH' ? /^[25]/ : /^[789]/).test(phoneDigits);
  const showPhoneError = method === 'mobile' && phone.length > 0 && !phoneValid;
  const canDeposit = amountNum >= MIN_DEPOSIT && !!method && !processing && (method !== 'mobile' || phoneValid);
  const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleDeposit() {
    if (!canDeposit) return;
    setProcessing(true);
    // Mocked: no real payment yet
    setTimeout(() => {
      setPaidAmount(amountNum);
      setProcessing(false);
      setShowSuccess(true);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('back')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Deposit Funds
        </h1>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto w-full">
        <div className="bg-gray-900 rounded-[24px] p-6 text-white relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-green-500/20 blur-2xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Balance</p>
          <p className="relative text-4xl font-black text-green-400 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {CURRENCY_LABEL} {money(balance)}
          </p>
          <p className="relative text-xs text-gray-400 mt-2">Add money to your wallet so you can wager on matches. No deposit fee.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('mobile')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                method === 'mobile' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === 'mobile' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <IconMobile size={20} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Mobile Money</p>
                  {method === 'mobile' && (
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <IconCheck size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Instant. Approve on your phone.</p>
              </div>
            </button>

            <button
              onClick={() => setMethod('paystack')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === 'paystack' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <IconBank size={20} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Paystack</p>
                  {method === 'paystack' && (
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <IconCheck size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Card or bank. Secure checkout.</p>
              </div>
            </button>
          </div>
        </div>

        {method === 'mobile' && (
          <Card className="p-4 flex flex-col gap-4 animate-fade-up">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Network</p>
              <div className="flex gap-2 flex-wrap">
                {networks.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setNetwork(n.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      network === n.id ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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
              type="tel"
              value={phone}
              onChange={v => setPhone(v.replace(/\D/g, '').replace(/^0+/, '').slice(0, phoneLen))}
              autoComplete="tel-national"
              error={showPhoneError ? (COUNTRY === 'GH' ? 'Enter 9 digits after +233, starting with 2 or 5' : 'Enter 10 digits after +234, starting with 7, 8 or 9') : undefined}
              prefix={
                <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {COUNTRY === 'GH' ? '+233' : '+234'}
                </span>
              }
            />
          </Card>
        )}

        {method === 'paystack' && (
          <Card className="p-4 animate-fade-up">
            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Pay with Paystack</p>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              You'll finish the payment on Paystack's secure checkout using your card or bank. This is a sandbox demo, so no real money moves.
            </p>
          </Card>
        )}

        {method && (
          <Card className="p-4 flex flex-col gap-4 animate-fade-up">
            <Input
              label={`Amount (${CURRENCY_LABEL})`}
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={v => setAmount(cleanAmount(v))}
              placeholder="0.00"
              prefix={
                <span className="text-sm font-semibold text-gray-700 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {CURRENCY_LABEL}
                </span>
              }
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick amount</p>
              <div className="flex gap-2">
                {[50, 100, 200, 500].map(g => fromGhs(g, CURRENCY_LABEL)).map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    {v.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>
            {belowMin && (
              <p className="text-xs text-red-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Minimum deposit is {CURRENCY_LABEL} {MIN_DEPOSIT}.
              </p>
            )}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Depositing</span><span className="font-bold text-gray-900">{CURRENCY_LABEL} {money(amountNum)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Deposit fee</span><span className="font-bold text-gray-900">{CURRENCY_LABEL} 0.00</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="font-bold text-gray-900">New balance</span><span className="font-black text-green-600">{CURRENCY_LABEL} {money(balance + (amountNum >= MIN_DEPOSIT ? amountNum : 0))}</span></div>
            </div>
          </Card>
        )}

        {method && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="glow-green animate-fade-up"
            onClick={handleDeposit}
            disabled={!canDeposit}
          >
            {processing ? 'Processing...' : 'Deposit Funds'}
            {!processing && <IconArrowRight size={16} />}
          </Button>
        )}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-fade-up shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center glow-green">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5.5 5.5L22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="text-center flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Deposit Successful!</h2>
              <p className="text-4xl font-bold text-green-600 tabular mt-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {CURRENCY_LABEL} {money(paidAmount)}
              </p>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Via{' '}
                <span className="font-medium text-gray-700">
                  {method === 'mobile' ? `${selectedNetwork?.label} •• ${phone.slice(-4)}` : 'Paystack'}
                </span>
              </p>
            </div>

            <div className="w-full bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Transaction ID</p>
                <p className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'monospace' }}>{txId}</p>
              </div>
              <button
                className="text-green-600 text-xs font-semibold hover:text-green-700 shrink-0"
                onClick={() => navigator.clipboard?.writeText(txId)}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Copy
              </button>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={() => { onDeposit(paidAmount); onNavigate('dashboard'); }}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}