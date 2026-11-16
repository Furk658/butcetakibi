import { useEffect, useState } from 'react';
import { FiArrowDownLeft, FiArrowUpRight, FiCalendar, FiX } from 'react-icons/fi';
import { CATEGORIES, getLocalDateString } from '../utils/calculations.js';

const emptyForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'Yemek',
  date: getLocalDateString(),
};

export default function TransactionModal({ isOpen, transaction, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const categories = CATEGORIES[form.type];

  useEffect(() => {
    if (!isOpen) return;
    setForm(transaction ? { ...transaction, amount: String(transaction.amount) } : emptyForm);
    setError('');
  }, [isOpen, transaction]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'type') {
        return { ...current, type: value, category: CATEGORIES[value][0] };
      }
      return { ...current, [name]: value };
    });
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amountText = String(form.amount).trim().replace(',', '.');
    const amount = Number(amountText);
    if (!form.title.trim()) {
      setError('Lütfen işlem için bir başlık girin.');
      return;
    }
    if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(amountText) || !Number.isFinite(amount) || amount <= 0) {
      setError('Tutar sıfırdan büyük olmalı; ondalık için virgül veya nokta kullanabilirsiniz (en fazla 2 basamak).');
      return;
    }
    if (!form.date) {
      setError('Lütfen işlem tarihini seçin.');
      return;
    }

    const saved = onSave({
      ...form,
      title: form.title.trim(),
      amount,
      ...(transaction ? { id: transaction.id } : {}),
    });
    if (saved !== false) onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{transaction ? 'İŞLEMİ GÜNCELLE' : 'YENİ KAYIT'}</p>
            <h2 id="modal-title">{transaction ? 'İşlemi düzenle' : 'İşlem ekle'}</h2>
          </div>
          <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Pencereyi kapat"><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-toggle" role="group" aria-label="İşlem türü">
            <button className={form.type === 'expense' ? 'selected expense-option' : ''} onClick={() => { setForm((current) => ({ ...current, type: 'expense', category: 'Yemek' })); setError(''); }} type="button">
              <FiArrowUpRight /> Gider
            </button>
            <button className={form.type === 'income' ? 'selected income-option' : ''} onClick={() => { setForm((current) => ({ ...current, type: 'income', category: 'Maaş' })); setError(''); }} type="button">
              <FiArrowDownLeft /> Gelir
            </button>
          </div>

          <label className="form-field">
            <span>İşlem başlığı</span>
            <input autoFocus maxLength={60} name="title" onChange={updateField} placeholder="Örn. Market alışverişi" value={form.title} />
          </label>

          <label className="form-field">
            <span>Tutar</span>
            <div className="input-with-suffix">
              <input autoComplete="off" inputMode="decimal" name="amount" onChange={updateField} placeholder="0,00" type="text" value={form.amount} />
              <span>₺</span>
            </div>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Kategori</span>
              <select name="category" onChange={updateField} value={form.category}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Tarih</span>
              <div className="date-input-wrap">
                <input max={getLocalDateString()} name="date" onChange={updateField} type="date" value={form.date} />
                <FiCalendar aria-hidden="true" />
              </div>
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="button button-quiet" onClick={onClose} type="button">Vazgeç</button>
            <button className="button button-primary save-button" type="submit">
              {transaction ? 'Değişiklikleri kaydet' : 'İşlemi kaydet'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
