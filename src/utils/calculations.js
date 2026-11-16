export const CATEGORIES = {
  expense: [
    'Yemek',
    'Ulaşım',
    'Alışveriş',
    'Faturalar',
    'Sağlık',
    'Eğlence',
    'Eğitim',
    'Diğer',
  ],
  income: ['Maaş', 'Freelance', 'Yatırım', 'Hediye', 'Diğer'],
};

export const CATEGORY_COLORS = {
  Yemek: '#f6a65b',
  Ulaşım: '#7c8cff',
  Alışveriş: '#e978a8',
  Faturalar: '#49c6b5',
  Sağlık: '#67a8f9',
  Eğlence: '#b28af5',
  Eğitim: '#e5c15d',
  Diğer: '#8691a6',
  Maaş: '#41d6a0',
  Freelance: '#72b7ff',
  Yatırım: '#b28af5',
  Hediye: '#f28aab',
};

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(amount, options = {}) {
  return new Intl.NumberFormat('tr-TR', {
    ...options,
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(amount);
}

export function formatShortDate(dateString) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateString}T12:00:00`));
}

export function calculateSummary(transactions, now = new Date()) {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

  return transactions.reduce(
    (summary, transaction) => {
      const amount = Number(transaction.amount) || 0;
      const isCurrentMonth = transaction.date.startsWith(monthKey);
      const isPreviousMonth = transaction.date.startsWith(previousMonthKey);
      const isBeforeCurrentMonth = transaction.date < `${monthKey}-01`;

      if (transaction.type === 'income') {
        summary.totalIncome += amount;
        if (isCurrentMonth) summary.monthlyIncome += amount;
        if (isPreviousMonth) summary.previousMonthIncome += amount;
        if (isBeforeCurrentMonth) summary.previousBalance += amount;
      } else {
        summary.totalExpense += amount;
        if (isCurrentMonth) summary.monthlyExpense += amount;
        if (isPreviousMonth) summary.previousMonthExpense += amount;
        if (isBeforeCurrentMonth) summary.previousBalance -= amount;
      }

      return summary;
    },
    {
      totalIncome: 0,
      totalExpense: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      previousMonthIncome: 0,
      previousMonthExpense: 0,
      previousBalance: 0,
    },
  );
}

export function getMonthlyChartData(transactions, now = new Date()) {
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  let runningBalance = transactions.reduce((balance, transaction) => {
    const transactionDate = new Date(`${transaction.date}T00:00:00`);
    if (transactionDate >= firstMonth) return balance;
    return balance + (transaction.type === 'income' ? 1 : -1) * Number(transaction.amount);
  }, 0);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(key));
    const income = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    runningBalance += income - expense;

    return {
      month: new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date),
      gelir: income,
      gider: expense,
      bakiye: runningBalance,
    };
  });
}

export function getPercentageChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getExpenseCategoryData(transactions) {
  const totals = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + Number(transaction.amount);
      return result;
    }, {});

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Diğer }))
    .sort((first, second) => second.value - first.value);
}

export function filterTransactions(transactions, filters) {
  return transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.category !== 'all' && transaction.category !== filters.category) return false;
    if (filters.date && transaction.date !== filters.date) return false;
    if (filters.month && !transaction.date.startsWith(filters.month)) return false;
    if (
      filters.search &&
      !`${transaction.title} ${transaction.category}`.toLocaleLowerCase('tr-TR')
        .includes(filters.search.trim().toLocaleLowerCase('tr-TR'))
    ) return false;
    return true;
  });
}
