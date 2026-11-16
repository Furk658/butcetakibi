import { useState } from 'react';
import { getLocalDateString } from '../utils/calculations.js';

const STORAGE_KEY = 'budgetflow.transactions.v1';
const DISMISSED_SAMPLES_KEY = 'budgetflow.samples.dismissed.v1';

function createSampleTransactions() {
  const today = new Date();
  const dateAtOffset = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return getLocalDateString(date);
  };

  return [
    { id: 'sample-1', title: 'Aylık maaş', amount: 42500, type: 'income', category: 'Maaş', date: dateAtOffset(1) },
    { id: 'sample-2', title: 'Market alışverişi', amount: 1840.5, type: 'expense', category: 'Yemek', date: dateAtOffset(1) },
    { id: 'sample-3', title: 'Freelance proje', amount: 7200, type: 'income', category: 'Freelance', date: dateAtOffset(4) },
    { id: 'sample-4', title: 'Elektrik faturası', amount: 685.75, type: 'expense', category: 'Faturalar', date: dateAtOffset(5) },
    { id: 'sample-5', title: 'Aylık ulaşım kartı', amount: 1250, type: 'expense', category: 'Ulaşım', date: dateAtOffset(8) },
    { id: 'sample-6', title: 'Kitap ve kırtasiye', amount: 930, type: 'expense', category: 'Eğitim', date: dateAtOffset(11) },
    { id: 'sample-7', title: 'Film gecesi', amount: 420, type: 'expense', category: 'Eğlence', date: dateAtOffset(14) },
    { id: 'sample-8', title: 'Yatırım getirisi', amount: 1850, type: 'income', category: 'Yatırım', date: dateAtOffset(20) },
  ];
}

function readStoredTransactions() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      const dismissedValue = window.localStorage.getItem(DISMISSED_SAMPLES_KEY);
      const dismissedIds = dismissedValue === null ? [] : JSON.parse(dismissedValue);
      if (!Array.isArray(dismissedIds) || dismissedIds.some((id) => typeof id !== 'string')) {
        throw new Error('Kaldırılan örnek işlemler beklenen biçimde değil.');
      }

      return {
        transactions: createSampleTransactions().filter((transaction) => !dismissedIds.includes(transaction.id)),
        error: '',
        sampleMode: true,
      };
    }

    const transactions = JSON.parse(storedValue);
    if (
      !Array.isArray(transactions) ||
      transactions.some((transaction) =>
        !transaction ||
        typeof transaction.id !== 'string' ||
        typeof transaction.title !== 'string' ||
        !Number.isFinite(Number(transaction.amount)) ||
        Number(transaction.amount) <= 0 ||
        !['income', 'expense'].includes(transaction.type) ||
        typeof transaction.category !== 'string' ||
        typeof transaction.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(transaction.date),
      )
    ) {
      throw new Error('Kayıtlı işlem verisi beklenen biçimde değil.');
    }

    return { transactions, error: '', sampleMode: false };
  } catch (error) {
    console.error('Bütçe Takibi kayıtlı işlemleri okuyamadı:', error);
    return {
      transactions: createSampleTransactions(),
      error: 'Kayıtlı veriler okunamadı. Örnek veriler gösteriliyor; tarayıcı depolama ayarlarınızı kontrol edin.',
      sampleMode: true,
      readOnly: true,
    };
  }
}

export default function useTransactions() {
  const [storedState, setStoredState] = useState(readStoredTransactions);
  const { transactions, sampleMode, readOnly } = storedState;
  const writesBlocked = readOnly || Boolean(storedState.error);

  function saveTransactions(nextTransactions) {
    if (writesBlocked) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTransactions));
      setStoredState((current) => ({
        ...current,
        transactions: nextTransactions,
        sampleMode: false,
        readOnly: false,
        error: '',
      }));
      return true;
    } catch (error) {
      console.error('Bütçe Takibi işlemleri tarayıcıya kaydedemedi:', error);
      setStoredState((current) => ({
        ...current,
        readOnly: true,
        error: 'Değişiklikler kaydedilemedi. Tarayıcı depolama alanınızı kontrol edin.',
      }));
      return false;
    }
  }

  function addTransaction(transaction) {
    return saveTransactions([
      { ...transaction, id: crypto.randomUUID() },
      ...(sampleMode ? [] : transactions),
    ]);
  }

  function updateTransaction(updatedTransaction) {
    const nextTransactions = transactions.map((transaction) =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
    );
    return saveTransactions(nextTransactions);
  }

  function deleteTransaction(id) {
    if (sampleMode) {
      if (writesBlocked || !transactions.some((transaction) => transaction.id === id && id.startsWith('sample-'))) {
        return false;
      }

      try {
        const storedIds = window.localStorage.getItem(DISMISSED_SAMPLES_KEY);
        const dismissedIds = storedIds === null ? [] : JSON.parse(storedIds);
        if (!Array.isArray(dismissedIds) || dismissedIds.some((sampleId) => typeof sampleId !== 'string')) {
          throw new Error('Kaldırılan örnek işlemler beklenen biçimde değil.');
        }

        window.localStorage.setItem(DISMISSED_SAMPLES_KEY, JSON.stringify([...new Set([...dismissedIds, id])]));
        setStoredState((current) => ({
          ...current,
          transactions: current.transactions.filter((transaction) => transaction.id !== id),
        }));
        return true;
      } catch (error) {
        console.error('Bütçe Takibi örnek işlemi kaldıramadı:', error);
        setStoredState((current) => ({
          ...current,
          readOnly: true,
          error: 'Örnek işlem kaldırılamadı. Tarayıcı depolama alanınızı kontrol edin.',
        }));
        return false;
      }
    }

    return saveTransactions(transactions.filter((transaction) => transaction.id !== id));
  }

  return {
    transactions,
    sampleMode,
    readOnly: writesBlocked,
    storageError: storedState.error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
