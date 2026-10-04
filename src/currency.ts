// One place for money conversion. Every amount in the app is defined in cedis (GHS).
// 10 GHS = 1,133.07 NGN. Update this number when the rate changes.
export const GHS_TO_NGN = 113.307;

// Cedi amount -> the user's currency. Naira is rounded UP to a whole naira.
export const fromGhs = (ghs: number, currency: string) =>
  currency === 'NGN' ? Math.ceil(ghs * GHS_TO_NGN) : ghs;

// The user's currency -> cedis (useful once a backend settles everything in one currency).
export const toGhs = (amount: number, currency: string) =>
  currency === 'NGN' ? amount / GHS_TO_NGN : amount;