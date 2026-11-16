import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiCheck, FiInfo, FiMoon, FiPlus, FiSettings, FiSun, FiX } from 'react-icons/fi';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import TransactionList from '../components/TransactionList.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import useTransactions from '../hooks/useTransactions.js';
import {
  calculateSummary,
  formatCurrency,
  getExpenseCategoryData,
  getMonthlyChartData,
} from '../utils/calculations.js';

const initialFilters = { type: 'all', category: 'all', date: '', month: '', search: '' };
const PROFILE_KEY = 'budgetflow.profile.v1';
const PREFERENCES_KEY = 'budgetflow.preferences.v1';
const Charts = lazy(() => import('../components/Charts.jsx'));

function readProfileName() {
  try {
    return window.localStorage.getItem(PROFILE_KEY)?.trim() || 'Alex';
  } catch (error) {
    console.error('Bütçe Takibi kullanıcı ayarlarını okuyamadı:', error);
    return 'Alex';
  }
}

function readThemePreference() {
  try {
    const preferences = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || '{}');
    return preferences.theme === 'light' ? 'light' : 'dark';
  } catch (error) {
    console.error('Bütçe Takibi görünüm tercihini okuyamadı:', error);
    return 'dark';
  }
}

export default function Dashboard() {
  const {
    transactions,
    sampleMode,
    readOnly,
    storageError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const [filters, setFilters] = useState(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [userName, setUserName] = useState(readProfileName);
  const [nameDraft, setNameDraft] = useState(userName);
  const [theme, setTheme] = useState(readThemePreference);
  const [now, setNow] = useState(() => new Date());
  const summary = useMemo(() => calculateSummary(transactions, now), [transactions, now]);
  const monthlyData = useMemo(() => getMonthlyChartData(transactions, now), [transactions, now]);
  const categoryData = useMemo(() => getExpenseCategoryData(transactions), [transactions]);
  const monthlyBalance = summary.monthlyIncome - summary.monthlyExpense;
  const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(now);
  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const todayLabel = dateFormatter.format(now).toLocaleUpperCase('tr-TR');
  const hour = now.getHours();
  const greetingText = hour >= 5 && hour < 12 ? 'Günaydın' : hour >= 12 && hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'light' ? '#f4f7fb' : '#090e16',
    );
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') return;
      if (pendingDelete) setPendingDelete(null);
      else if (showSettings) setShowSettings(false);
      else if (isSidebarOpen) setIsSidebarOpen(false);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, pendingDelete, showSettings]);

  function showToast(message, tone = 'success') {
    setToast({ message, tone, id: Date.now() });
  }

  function openNewTransaction() {
    if (readOnly) {
      showToast('Kayıtlı veriler salt okunur. Verilerin korunması için yeni kayıt alınamadı.', 'error');
      return;
    }
    setEditingTransaction(null);
    setIsModalOpen(true);
    setIsSidebarOpen(false);
  }

  function openEditTransaction(transaction) {
    if (sampleMode || readOnly) return;
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  function saveTransaction(transaction) {
    if (readOnly) {
      showToast('Tarayıcı depolama alanına yazılamadığı için değişiklik kaydedilmedi.', 'error');
      return false;
    }
    const saved = editingTransaction
      ? updateTransaction(transaction)
      : addTransaction(transaction);
    if (saved) {
      showToast(editingTransaction ? 'İşlem başarıyla güncellendi.' : 'Yeni işlem bütçene eklendi.');
    } else {
      showToast('Değişiklik kaydedilemedi. Kayıtlı verilerin korunuyor.', 'error');
    }
    return saved;
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (!deleteTransaction(pendingDelete.id)) {
      showToast('İşlem silinemedi; kayıtlı verilerin korunuyor.', 'error');
      return;
    }
    showToast('İşlem silindi.');
    setPendingDelete(null);
  }

  function handleNavigation(item) {
    setIsSidebarOpen(false);
    setShowSettings(false);
    setActiveSection(item.section);
    if (item.type) {
      setFilters((current) => ({ ...current, type: item.type, category: 'all', date: '', month: '', search: '' }));
    }
    window.setTimeout(() => {
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function openSettings() {
    setNameDraft(userName);
    setShowSettings(true);
    setActiveSection('settings');
    setIsSidebarOpen(false);
  }

  function saveSettings(event) {
    event.preventDefault();
    const nextName = nameDraft.trim();
    if (!nextName) {
      showToast('İsim alanı boş bırakılamaz.', 'error');
      return;
    }
    try {
      window.localStorage.setItem(PROFILE_KEY, nextName);
      setUserName(nextName);
      setShowSettings(false);
      setActiveSection('overview');
      showToast('Hesap ayarların kaydedildi.');
    } catch (error) {
      console.error('Bütçe Takibi kullanıcı ayarlarını kaydedemedi:', error);
      showToast('Ayarlar kaydedilemedi. Tarayıcı depolama alanınızı kontrol edin.', 'error');
    }
  }

  function changeTheme(nextTheme) {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ theme: nextTheme }));
    } catch (error) {
      console.error('Bütçe Takibi görünüm tercihini kaydedemedi:', error);
      showToast('Tema değişti ancak tercihiniz kaydedilemedi.', 'error');
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        onAddTransaction={openNewTransaction}
        transactionCount={transactions.length}
        activeSection={activeSection}
        onNavigate={handleNavigation}
        onOpenSettings={openSettings}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={userName}
        readOnly={readOnly}
      />
      <main className="main-content" id="overview">
        <Header
          onAddTransaction={openNewTransaction}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onNotify={() => showToast('Şu an yeni bir bildirimin yok.', 'info')}
          onOpenSettings={openSettings}
        />
        <div className="dashboard-content">
          {storageError && <div className="storage-alert" role="alert"><FiInfo />{storageError}</div>}
          <section className="welcome-row">
            <div>
              <p className="eyebrow welcome-eyebrow">{todayLabel}</p>
              <h1>{greetingText}, {userName}<span>.</span></h1>
              <p className="welcome-copy">Paranın nereye gittiğini bil, geleceğini güvenle planla.</p>
            </div>
            <button className="button button-primary welcome-add" onClick={openNewTransaction} type="button">
              <FiPlus aria-hidden="true" /> Yeni işlem
            </button>
          </section>

          <section aria-label="Bütçe özeti">
            <div className="section-title-row">
              <div><h2 className="section-title">Finansal özet</h2><span className="section-subtitle">Bu ayki durumun, bir bakışta</span></div>
              <span className={`updated-label ${sampleMode ? 'sample-indicator' : ''}`}>
                <span /> {sampleMode ? 'Örnek veriler' : 'Canlı güncelleniyor'}
              </span>
            </div>
            <SummaryCards summary={summary} />
          </section>

          <section className="monthly-highlight">
            <div className="monthly-highlight-icon"><FiArrowUpRight aria-hidden="true" /></div>
            <div className="monthly-highlight-copy">
              <span>{monthName} ayı net birikimin</span>
              <strong>{formatCurrency(monthlyBalance)}</strong>
            </div>
            <span className="highlight-divider" />
            <p>Her adımını takip et, finansal hedeflerine güvenle yaklaş.</p>
            <button className="highlight-action" onClick={openNewTransaction} type="button" aria-label="Yeni işlem ekle"><FiPlus /></button>
          </section>

          <Suspense fallback={<div className="charts-loading panel">Grafikler yükleniyor…</div>}>
            <Charts
              monthlyData={monthlyData}
              categoryData={categoryData}
              monthlyIncome={summary.monthlyIncome}
              monthlyExpense={summary.monthlyExpense}
              now={now}
            />
          </Suspense>

          <TransactionList
            transactions={transactions}
            filters={filters}
            onFiltersChange={setFilters}
            onAdd={openNewTransaction}
            onEdit={openEditTransaction}
            onDelete={setPendingDelete}
            sampleMode={sampleMode}
            readOnly={readOnly}
          />
          <footer className="app-footer">
            <span>© {new Date().getFullYear()} Bütçe Takibi</span>
            <span>Finansal kontrol, senin elinde <span className="footer-heart">♥</span></span>
          </footer>
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        transaction={editingTransaction}
        onClose={closeModal}
        onSave={saveTransaction}
      />

      {pendingDelete && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPendingDelete(null)}>
          <section className="confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="confirmation-icon"><FiInfo aria-hidden="true" /></span>
            <h2 id="delete-title">İşlem silinsin mi?</h2>
            <p><strong>{pendingDelete.title}</strong> kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button className="button button-quiet" onClick={() => setPendingDelete(null)} type="button">Vazgeç</button>
              <button className="button button-danger" onClick={confirmDelete} type="button"><FiX /> İşlemi sil</button>
            </div>
          </section>
        </div>
      )}

      {showSettings && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowSettings(false)}>
          <section className="transaction-modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">HESAP TERCİHLERİ</p>
                <h2 id="settings-title">Ayarlar</h2>
              </div>
              <button className="icon-button modal-close" type="button" onClick={() => setShowSettings(false)} aria-label="Ayarları kapat"><FiX /></button>
            </div>
            <form onSubmit={saveSettings}>
              <label className="form-field">
                <span>Görünen ad</span>
                <input autoFocus maxLength={40} onChange={(event) => setNameDraft(event.target.value)} value={nameDraft} />
              </label>
              <div className="settings-preference settings-theme-preference">
                <span className="settings-preference-icon"><FiSettings aria-hidden="true" /></span>
                <span><strong>Görünüm</strong><small>Koyu veya açık tema seçin</small></span>
                <div className="theme-options" role="group" aria-label="Görünüm teması">
                  <button
                    className="theme-option"
                    type="button"
                    aria-pressed={theme === 'dark'}
                    onClick={() => changeTheme('dark')}
                  >
                    <FiMoon aria-hidden="true" /> Koyu
                  </button>
                  <button
                    className="theme-option"
                    type="button"
                    aria-pressed={theme === 'light'}
                    onClick={() => changeTheme('light')}
                  >
                    <FiSun aria-hidden="true" /> Açık
                  </button>
                </div>
              </div>
              <div className="settings-preference">
                <span className="settings-preference-icon"><FiCheck aria-hidden="true" /></span>
                <span><strong>Para birimi</strong><small>Türk Lirası (₺)</small></span>
                <span className="preference-status">TRY</span>
              </div>
              <div className="modal-actions">
                <button className="button button-quiet" onClick={() => setShowSettings(false)} type="button">Kapat</button>
                <button className="button button-primary save-button" type="submit">Ayarları kaydet</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.tone}`} key={toast.id} role={toast.tone === 'error' ? 'alert' : 'status'} aria-live="polite">
          <span className="toast-icon">{toast.tone === 'success' ? <FiCheck /> : <FiInfo />}</span>
          <span>{toast.message}</span>
          <button type="button" aria-label="Bildirimi kapat" onClick={() => setToast(null)}><FiX /></button>
        </div>
      )}
    </div>
  );
}
