import { FiActivity, FiBell, FiMenu, FiPlus, FiUser } from 'react-icons/fi';

export default function Header({ onAddTransaction, onOpenMenu, onNotify, onOpenSettings, readOnly }) {
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className="topbar">
      <button className="mobile-nav-toggle icon-button" type="button" aria-label="Navigasyon menüsünü aç" onClick={onOpenMenu}>
        <FiMenu aria-hidden="true" />
      </button>
      <div className="mobile-brand">
        <span className="brand-mark"><FiActivity /></span>
        <span>Bütçe Takibi</span>
      </div>
      <div className="breadcrumb">
        <span>Çalışma Alanı</span>
        <span className="breadcrumb-divider">/</span>
        <strong>Genel Bakış</strong>
      </div>
      <div className="topbar-actions">
        <span className="today-label">{dateLabel}</span>
        <button className="icon-button notification-button" type="button" aria-label="Bildirimleri görüntüle" onClick={onNotify}>
          <FiBell aria-hidden="true" />
          <span className="notification-dot" />
        </button>
        <button className="button button-primary header-add" onClick={onAddTransaction} type="button" aria-label="İşlem ekle" disabled={readOnly}>
          <FiPlus aria-hidden="true" />
          <span>İşlem ekle</span>
        </button>
        <button className="profile-button" type="button" aria-label="Hesap ayarlarını aç" onClick={onOpenSettings}>
          <FiUser aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
