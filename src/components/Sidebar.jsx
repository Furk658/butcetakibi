import {
  FiActivity,
  FiBarChart2,
  FiDollarSign,
  FiGrid,
  FiPlus,
  FiRepeat,
  FiSettings,
  FiTrendingDown,
  FiX,
} from 'react-icons/fi';

const navigation = [
  { label: 'Dashboard', href: '#overview', icon: FiGrid, section: 'overview' },
  { label: 'İşlemler', href: '#transactions', icon: FiRepeat, section: 'transactions' },
  { label: 'Gelirler', href: '#transactions', icon: FiDollarSign, type: 'income', section: 'income' },
  { label: 'Giderler', href: '#transactions', icon: FiTrendingDown, type: 'expense', section: 'expense' },
  { label: 'Analizler', href: '#analytics', icon: FiBarChart2, section: 'analytics' },
];

export default function Sidebar({
  onAddTransaction,
  transactionCount,
  activeSection,
  onNavigate,
  onOpenSettings,
  isOpen,
  onClose,
  userName,
  readOnly,
}) {
  function navigate(event, item) {
    event.preventDefault();
    onNavigate(item);
  }

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        type="button"
        aria-label="Menüyü kapat"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Ana navigasyon">
        <div className="sidebar-brand-row">
          <a className="brand" href="#overview" onClick={(event) => navigate(event, navigation[0])} aria-label="Bütçe Takibi ana sayfa">
            <span className="brand-mark"><FiActivity /></span>
            <span>Bütçe Takibi</span>
          </a>
          <button className="sidebar-close" type="button" aria-label="Menüyü kapat" onClick={onClose}><FiX /></button>
        </div>

        <div className="workspace-label">ÇALIŞMA ALANI</div>
        <nav className="main-nav" aria-label="Ana menü">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                href={item.href}
                key={item.label}
                aria-label={item.label}
                aria-current={activeSection === item.section ? 'page' : undefined}
                onClick={(event) => navigate(event, item)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {item.section === 'transactions' && <span className="nav-count">{transactionCount}</span>}
              </a>
            );
          })}
          <button className={`nav-link settings-link ${activeSection === 'settings' ? 'active' : ''}`} type="button" aria-label="Ayarlar" onClick={onOpenSettings}>
            <FiSettings aria-hidden="true" />
            <span>Ayarlar</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-glow" />
            <p>Her küçük adım, daha güçlü bir finansal gelecek.</p>
            <span className="tip-caption">Bütçeni yönet, hedeflerine ulaş.</span>
          </div>
          <button className="sidebar-add" onClick={onAddTransaction} type="button" disabled={readOnly}>
            <span className="sidebar-add-icon"><FiPlus aria-hidden="true" /></span>
            <span>Yeni işlem ekle</span>
            <kbd>+</kbd>
          </button>
          <div className="profile">
            <div className="avatar">{userName.slice(0, 1).toLocaleUpperCase('tr-TR')}</div>
            <div className="profile-copy">
              <strong>{userName}</strong>
              <span>Kişisel hesap</span>
            </div>
            <span className="profile-status" aria-label="Hesap aktif" />
          </div>
        </div>
      </aside>
    </>
  );
}
