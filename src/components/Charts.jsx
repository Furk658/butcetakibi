import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiArrowUpRight } from 'react-icons/fi';
import { formatCurrency } from '../utils/calculations.js';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <span>{label || payload[0].name}</span>
      {payload.map((item) => (
        <strong key={item.dataKey || item.name} style={{ color: item.color || item.payload.color }}>
          {item.name}: {formatCurrency(item.value)}
        </strong>
      ))}
    </div>
  );
}

export default function Charts({ monthlyData, categoryData, monthlyIncome, monthlyExpense, now = new Date() }) {
  const totalExpenses = categoryData.reduce((sum, category) => sum + category.value, 0);
  const monthTitle = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(now);

  return (
    <div className="charts-grid" id="analytics">
      <section className="panel trend-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PERFORMANS</p>
            <h2>Gelir ve gider</h2>
          </div>
          <span className="period-label" aria-label={`Son 6 ay, ${monthTitle}`}>Son 6 ay</span>
        </div>
        <div className="chart-legend">
          <span><i className="legend-dot income-dot" /> Gelir</span>
          <span><i className="legend-dot expense-dot" /> Gider</span>
          <span className="legend-note"><FiArrowUpRight aria-hidden="true" /> Son 6 ay</span>
        </div>
        <div className="trend-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#39d6a0" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#39d6a0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7786" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ff7786" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#202633" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#778196', fontSize: 12 }} dy={12} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#778196', fontSize: 11 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#39d6a0" strokeWidth={2.5} fill="url(#incomeGradient)" activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="gider" name="Gider" stroke="#ff7786" strokeWidth={2.5} fill="url(#expenseGradient)" activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-summary">
          <div><span className="summary-label">Bu ay gelir</span><strong className="mini-income">{formatCurrency(monthlyIncome)}</strong></div>
          <span className="chart-summary-divider" />
          <div><span className="summary-label">Bu ay gider</span><strong className="mini-expense">{formatCurrency(monthlyExpense)}</strong></div>
        </div>
      </section>

      <section className="panel balance-trend-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">BİRİKİM YOLCULUĞU</p>
            <h2>Bakiye değişimi</h2>
          </div>
          <span className="balance-chart-period">Son 6 ay</span>
        </div>
        <div className="balance-chart-legend">
          <i className="legend-dot income-dot" /> Ay sonu bakiyesi
        </div>
        <div className="balance-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#202633" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#778196', fontSize: 11 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#778196', fontSize: 10 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="bakiye"
                name="Bakiye"
                stroke="#54d8a8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#54d8a8', stroke: '#111721', strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel category-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">HARCAMA DAĞILIMI</p>
            <h2>Kategoriler</h2>
          </div>
        </div>
        {categoryData.length ? (
          <>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="92%" paddingAngle={4} stroke="none" cornerRadius={5}>
                    {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>Toplam gider</span>
                <strong>{formatCurrency(totalExpenses, { maximumFractionDigits: 0 })}</strong>
              </div>
            </div>
            <div className="category-legend">
              {categoryData.slice(0, 4).map((category) => (
                <div className="category-row" key={category.name}>
                  <span className="category-name"><i style={{ backgroundColor: category.color }} />{category.name}</span>
                  <strong>{formatCurrency(category.value)}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-chart">Harcama dağılımını görmek için bir gider ekleyin.</div>
        )}
      </section>
    </div>
  );
}
