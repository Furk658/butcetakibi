import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiCreditCard,
  FiPercent,
} from 'react-icons/fi';
import { formatCurrency, getPercentageChange } from '../utils/calculations.js';

function ChangeBadge({ value, invert = false }) {
  const isNeutral = value === null;
  const isPositive = !isNeutral && (invert ? value <= 0 : value >= 0);
  const Icon = value !== null && value < 0 ? FiArrowDownRight : FiArrowUpRight;
  const label = value === null ? 'Yeni' : `${Math.abs(value).toFixed(1)}%`;

  return (
    <span className={`change-pill ${isNeutral ? 'neutral' : isPositive ? 'positive' : 'negative'}`}>
      {value !== null && <Icon aria-hidden="true" />}
      {label}
    </span>
  );
}

function SummaryCard({ label, value, change, tone, icon: Icon, detail, note, invertChange = false }) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-card-top">
        <span className="summary-icon"><Icon aria-hidden="true" /></span>
        <span className="card-period">BU AY</span>
      </div>
      <p className="summary-label">{label}</p>
      <strong className="summary-value">{value}</strong>
      <div className="summary-footer">
        <ChangeBadge value={change} invert={invertChange} />
        <span className="summary-detail">{detail}</span>
      </div>
      <span className="summary-note">{note}</span>
    </article>
  );
}

export default function SummaryCards({ summary }) {
  const balance = summary.totalIncome - summary.totalExpense;
  const monthlyNet = summary.monthlyIncome - summary.monthlyExpense;
  const previousNet = summary.previousMonthIncome - summary.previousMonthExpense;
  const savingsRate = summary.monthlyIncome > 0
    ? (monthlyNet / summary.monthlyIncome) * 100
    : 0;
  return (
    <div className="summary-grid">
      <SummaryCard
        label="Toplam bakiye"
        value={formatCurrency(balance)}
        change={getPercentageChange(balance, summary.previousBalance)}
        detail={`${formatCurrency(monthlyNet)} net`}
        note="Önceki ay sonuna göre"
        tone="balance-card"
        icon={FiCreditCard}
      />
      <SummaryCard
        label="Aylık gelir"
        value={formatCurrency(summary.monthlyIncome)}
        change={getPercentageChange(summary.monthlyIncome, summary.previousMonthIncome)}
        detail={`${formatCurrency(summary.previousMonthIncome)} önceki ay`}
        note="Önceki aya göre"
        tone="income"
        icon={FiArrowDownRight}
      />
      <SummaryCard
        label="Aylık gider"
        value={formatCurrency(summary.monthlyExpense)}
        change={getPercentageChange(summary.monthlyExpense, summary.previousMonthExpense)}
        detail={`${formatCurrency(summary.previousMonthExpense)} önceki ay`}
        note="Önceki aya göre"
        tone="expense"
        icon={FiArrowUpRight}
        invertChange
      />
      <SummaryCard
        label="Tasarruf oranı"
        value={`%${savingsRate.toFixed(1)}`}
        change={getPercentageChange(savingsRate, summary.previousMonthIncome > 0
          ? ((previousNet / summary.previousMonthIncome) * 100)
          : 0)}
        detail={`${formatCurrency(monthlyNet)} net birikim`}
        note={summary.monthlyIncome ? 'Aylık gelirinin içinden' : 'Gelir ekleyerek başla'}
        tone="savings"
        icon={FiPercent}
      />
    </div>
  );
}
