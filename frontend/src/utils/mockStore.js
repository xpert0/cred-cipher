const API_URL = 'http://localhost:3000/api';

export const getStore = async () => {
  try {
    const res = await fetch(`${API_URL}/store`);
    return await res.json();
  } catch (e) {
    return { poolBalance: 0, lenderBalances: {}, transactions: [] };
  }
};

export const getLenderBalance = async (wallet) => {
  const store = await getStore();
  return store.lenderBalances[wallet] || 0;
};

export const provideLiquidity = async (wallet, amount) => {
  const res = await fetch(`${API_URL}/lender/provide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, amount })
  });
  const data = await res.json();
  return data.balance;
};

export const withdrawLiquidity = async (wallet, amount) => {
  const res = await fetch(`${API_URL}/lender/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, amount })
  });
  
  if (!res.ok) return false;
  return true;
};

export const createPayment = async (merchantId, amount, borrower) => {
  const res = await fetch(`${API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchantId, amount, borrower })
  });
  const data = await res.json();
  return data.receiptId;
};

export const verifyPayment = async (receiptId, callerWallet) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiptId, callerWallet })
  });
  return await res.json();
};