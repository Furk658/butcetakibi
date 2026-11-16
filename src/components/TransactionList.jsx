import { useState } from 'react';
import { FiArrowDownLeft, FiArrowUpRight, FiDownload, FiEdit2, FiFilter, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { CATEGORIES, CATEGORY_COLORS, filterTransactions, formatCurrency, formatShortDate, getLocalDateString } from '../utils/calculations.js';

export default function TransactionList({ transactions, filters, onFiltersChange, onAdd, onEdit, onDelete, sampleMode, readOnly }) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const visibleTransactions = [...filterTransactions(transactions, filters)].sort((first, second) => {
    if (sortBy === 'date-asc') return first.date.localeCompare(second.date) || first.title.localeCompare(second.title, 'tr');
    if (sortBy === 'amount-desc') return Number(second.amount) - Number(first.amount) || second.date.localeCompare(first.date);
    if (sortBy === 'amount-asc') return Number(first.amount) - Number(second.amount) || second.date.localeCompare(first.date);
    if (sortBy === 'title-asc') return first.title.localeCompare(second.title, 'tr');
    return second.date.localeCompare(first.date) || first.title.localeCompare(second.title, 'tr');
  });
  const displayedTransactions = showAll ? visibleTransactions : visibleTransactions.slice(0, 8);

  function updateFilter(event) {
    setShowAll(false);
    onFiltersChange((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetFilters() {
    setShowAll(false);
    onFiltersChange({ type: 'all', category: 'all', date: '', month: '', search: '' });
  }

  function exportTransactions() {
    const header = ['İşlem', 'Tür', 'Kategori', 'Tarih', 'Tutar (TRY)'];
    const rows = visibleTransactions.map((transaction) => [
      transaction.title,
      transaction.type === 'income' ? 'Gelir' : 'Gider',
      transaction.category,
      transaction.date,
      Number(transaction.amount).toFixed(2).replace('.', ','),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvField).join(';'))
      .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `butce-takibi-islemler-${getLocalDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="panel transactions-panel" id="transactions">
      <div className="panel-heading transaction-heading">
        <div>
          <p className="eyebrow">HESAP HAREKETLERİ</p>
          <h2>
            Son işlemler <span className="transaction-count">{visibleTransactions.length}</span>
            {sampleMode && <span className="sample-tag">ÖRNEK</span>}
          </h2>
        </div>
        <div className="transaction-heading-actions">
          <button className="export-button" type="button" onClick={exportTransactions} disabled={!visibleTransactions.length}>
            <FiDownload aria-hidden="true" /> CSV indir
          </button>
          <button className="text-button" type="button" onClick={resetFilters}>
            Tümünü gör <span>→</span>
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <label className="transaction-search">
          <FiSearch aria-hidden="true" />
          <input
            aria-label="İşlem ara"
            name="search"
            onChange={updateFilter}
            placeholder="İşlemlerde ara..."
            type="search"
            value={filters.search || ''}
          />
          {filters.search && (
            <button type="button" aria-label="Aramayı temizle" onClick={() => onFiltersChange((current) => ({ ...current, search: '' }))}>
              <FiX aria-hidden="true" />
            </button>
          )}
        </label>
        <span className="filter-label"><FiFilter aria-hidden="true" /> Filtrele</span>
        <select aria-label="İşlem türüne göre filtrele" name="type" onChange={updateFilter} value={filters.type}>
          <option value="all">Tüm işlemler</option>
          <option value="income">Gelirler</option>
          <option value="expense">Giderler</option>
        </select>
        <select aria-label="Kategoriye göre filtrele" name="category" onChange={updateFilter} value={filters.category}>
          <option value="all">Tüm kategoriler</option>
          {[...new Set([...CATEGORIES.income, ...CATEGORIES.expense])].map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select aria-label="İşlemleri sırala" onChange={(event) => { setShowAll(false); setSortBy(event.target.value); }} value={sortBy}>
          <option value="date-desc">En yeni</option>
          <option value="date-asc">En eski</option>
          <option value="amount-desc">Tutar: yüksek</option>
          <option value="amount-asc">Tutar: düşük</option>
          <option value="title-asc">İsim: A–Z</option>
        </select>
        <label className="month-filter">
          <span className="sr-only">Aya göre filtrele</span>
          <input aria-label="Aya göre filtrele" name="month" onChange={updateFilter} type="month" value={filters.month} />
        </label>
        <label className="date-filter">
          <span className="sr-only">Tarihe göre filtrele</span>
          <input aria-label="Tarihe göre filtrele" name="date" onChange={updateFilter} type="date" value={filters.date} />
        </label>
      </div>

      <div className="transaction-table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>İŞLEM</th>
              <th>KATEGORİ</th>
              <th>TARİH</th>
              <th className="amount-heading">TUTAR</th>
              <th><span className="sr-only">İşlem menüsü</span></th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const Icon = isIncome ? FiArrowDownLeft : FiArrowUpRight;
              return (
                <tr key={transaction.id}>
                  <td>
                    <div className="transaction-name">
                      <span className={`transaction-icon ${isIncome ? 'transaction-income' : 'transaction-expense'}`}><Icon aria-hidden="true" /></span>
                      <span><strong>{transaction.title}</strong><small>{isIncome ? 'Gelir' : 'Gider'}</small></span>
                    </div>
                  </td>
                  <td><span className="category-tag"><i style={{ backgroundColor: categoryColor(transaction.category) }} />{transaction.category}</span></td>
                  <td className="transaction-date">{formatShortDate(transaction.date)}</td>
                  <td className={`transaction-amount ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                    {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" disabled={sampleMode || readOnly} aria-label={`${transaction.title} işlemini düzenle`} onClick={() => onEdit(transaction)}><FiEdit2 /></button>
                      <button type="button" disabled={readOnly} aria-label={`${transaction.title} işlemini sil`} onClick={() => onDelete(transaction)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleTransactions.length === 0 && (
          <div className="empty-transactions">
            <span><FiFilter /></span>
            <strong>Bu filtrelerle eşleşen işlem yok</strong>
            <p>Filtrelerinizi değiştirebilir veya yeni bir kayıt ekleyebilirsiniz.</p>
          </div>
        )}
        {visibleTransactions.length > 8 && (
          <button className="load-more" onClick={() => setShowAll((current) => !current)} type="button">
            {showAll ? 'Daha az göster' : 'Tüm işlemleri görüntüle'}
          </button>
        )}
        {transactions.length === 0 && (
          <button className="empty-add" onClick={onAdd} type="button" disabled={readOnly}><FiPlus /> İlk işlemini ekle</button>
        )}
      </div>
    </section>
  );
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Diğer;
}

function csvField(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}
