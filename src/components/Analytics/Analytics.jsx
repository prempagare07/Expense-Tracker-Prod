/**
 * Analytics — D3.js-powered spending analytics
 *
 * Design principles applied:
 *  • Munzner's laws: encode data with appropriate visual channels (length → amount,
 *    color hue → category, position → time), minimise chart junk, honest scales.
 *  • Detail on demand: tooltips surface exact values only on hover, keeping the
 *    overview clean (Shneiderman's mantra).
 *  • Pre-attentive attributes: ASU maroon/gold for primary encoding so the eye is
 *    guided before conscious attention kicks in.
 *  • Animated transitions on data change so the viewer can track what changed.
 *  • Demo mode: when no expenses exist, engaging animated sample charts show the
 *    full capability of the analytics dashboard.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../utils/constants';
import './Analytics.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toMonthKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [yr, mo] = key.split('-');
  return `${MONTH_ABBR[+mo - 1]} '${yr.slice(2)}`;
}

function fmt(n) {
  return n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${n.toFixed(0)}`;
}

function fmtFull(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Category info lookup
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

// ─── Demo Data (shown when no real expenses exist) ────────────────────────────
// 6 months of plausible student spending — total must match across both views
const DEMO_MONTHLY = [
  { month: '2025-09', total: 580,  count: 5  },
  { month: '2025-10', total: 720,  count: 8  },
  { month: '2025-11', total: 640,  count: 6  },
  { month: '2025-12', total: 890,  count: 10 },
  { month: '2026-01', total: 530,  count: 4  },
  { month: '2026-02', total: 740,  count: 9  },
];

const DEMO_CATEGORY = [
  { category: 'food',          total: 1200, count: 18, info: CAT_MAP['food']          },
  { category: 'housing',       total: 980,  count: 5,  info: CAT_MAP['housing']       },
  { category: 'shopping',      total: 850,  count: 8,  info: CAT_MAP['shopping']      },
  { category: 'transport',     total: 620,  count: 7,  info: CAT_MAP['transport']     },
  { category: 'entertainment', total: 450,  count: 4,  info: CAT_MAP['entertainment'] },
];

const DEMO_STATS = {
  total:    4100,
  avgMonth: 4100 / 6,
  topCat:   CAT_MAP['food']?.label ?? 'Food & Dining',
  topIcon:  CAT_MAP['food']?.icon  ?? '🍽️',
  count:    42,
};

// ─── Tooltip singleton ────────────────────────────────────────────────────────
function useTooltip() {
  const ref = useRef(null);

  const show = useCallback((event, html) => {
    const tip = ref.current;
    if (!tip) return;
    tip.innerHTML = html;
    tip.style.display = 'block';
    const { clientX: x, clientY: y } = event;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    const vw = window.innerWidth,  vh = window.innerHeight;
    tip.style.left = Math.min(x + 14, vw - tw - 8) + 'px';
    tip.style.top  = Math.min(y - 10, vh - th - 8) + 'px';
  }, []);

  const hide = useCallback(() => {
    if (ref.current) ref.current.style.display = 'none';
  }, []);

  return { ref, show, hide };
}

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────
function BarChart({ data, tooltip, isDemo }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 500;
    const H = 210;
    const m = { top: 16, right: 16, bottom: 44, left: 54 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    if (!data.length) {
      g.append('text')
        .attr('x', w / 2).attr('y', h / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.25)')
        .attr('font-size', '0.8rem')
        .text('No data for selected range');
      return;
    }

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, w])
      .padding(0.32);

    const maxVal = d3.max(data, d => d.total) || 1;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.12])
      .range([h, 0]);

    // Grid lines
    const yTicks = y.ticks(4);
    g.append('g').attr('class', 'grid')
      .selectAll('line').data(yTicks).join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '3,3');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(monthLabel).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.12)'))
      .call(ax => ax.selectAll('text')
        .attr('fill', 'rgba(255,255,255,0.45)')
        .attr('font-size', '0.68rem')
        .attr('dy', '1.2em'));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(fmt).tickSize(0))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', 'rgba(255,255,255,0.35)')
        .attr('font-size', '0.68rem'));

    // Bars — staggered enter animation for demo mode
    const bars = g.selectAll('.bar').data(data).join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month))
      .attr('width', x.bandwidth())
      .attr('rx', 5)
      .attr('fill', isDemo ? 'rgba(140,29,64,0.55)' : '#8c1d40')
      .attr('y', h)
      .attr('height', 0);

    bars.transition()
      .delay((_, i) => i * 80)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.total))
      .attr('height', d => h - y(d.total))
      .attr('fill', isDemo ? '#8c1d40' : '#8c1d40');

    // Hover interactions
    bars.on('mouseenter', function(event, d) {
        d3.select(this).interrupt().transition().duration(120).attr('fill', '#ffc627');
        tooltip.show(event,
          `<div class="tip-month">${monthLabel(d.month)}</div>
           <div class="tip-val">${fmtFull(d.total)}</div>
           <div class="tip-sub">${d.count} transaction${d.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`);
      })
      .on('mousemove', (event, d) => tooltip.show(event,
          `<div class="tip-month">${monthLabel(d.month)}</div>
           <div class="tip-val">${fmtFull(d.total)}</div>
           <div class="tip-sub">${d.count} transaction${d.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`))
      .on('mouseleave', function() {
        d3.select(this).interrupt().transition().duration(120).attr('fill', '#8c1d40');
        tooltip.hide();
      });

    // Value labels
    if (x.bandwidth() > 30) {
      g.selectAll('.bar-label').data(data).join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.month) + x.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,198,39,0.7)')
        .attr('font-size', '0.65rem')
        .attr('font-weight', '700')
        .attr('y', h)
        .transition()
        .delay((_, i) => i * 80)
        .duration(600).ease(d3.easeCubicOut)
        .attr('y', d => y(d.total) - 4)
        .text(d => fmt(d.total));
    }
  }, [data, isDemo]);

  return <svg ref={svgRef} className="analytics-svg" />;
}

// ─── Category Donut Chart ─────────────────────────────────────────────────────
function DonutChart({ data, tooltip, isDemo }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement;
    const size = Math.min(container.clientWidth || 240, 240);
    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.42, innerR = size * 0.26;

    const svg = d3.select(svgRef.current)
      .attr('width', size).attr('height', size);
    svg.selectAll('*').remove();

    const total = d3.sum(data, d => d.total);

    if (!data.length) {
      svg.append('text')
        .attr('x', cx).attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'rgba(255,255,255,0.25)')
        .attr('font-size', '0.75rem')
        .text('No data');
      return;
    }

    const pie  = d3.pie().value(d => d.total).sort(null).padAngle(0.025);
    const arc  = d3.arc().innerRadius(innerR).outerRadius(outerR).cornerRadius(4);
    const hArc = d3.arc().innerRadius(innerR).outerRadius(outerR + 8).cornerRadius(4);

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Slices — sweep in with stagger for demo mode
    const slices = g.selectAll('.slice').data(pie(data)).join('path')
      .attr('class', 'slice')
      .attr('fill', d => d.data.info.color)
      .attr('d', d3.arc().innerRadius(innerR).outerRadius(0).cornerRadius(4))
      .style('cursor', 'pointer');

    slices.transition()
      .delay((_, i) => isDemo ? i * 100 : 0)
      .duration(700).ease(d3.easeCubicOut)
      .attrTween('d', function(d) {
        const i = d3.interpolate(
          { startAngle: d.startAngle, endAngle: d.startAngle },
          d
        );
        return t => arc(i(t));
      });

    slices
      .on('mouseenter', function(event, d) {
        d3.select(this).interrupt().transition().duration(120).attr('d', hArc);
        const pct = ((d.data.total / total) * 100).toFixed(1);
        tooltip.show(event,
          `<div class="tip-cat">${d.data.info.icon} ${d.data.info.label}</div>
           <div class="tip-val">${fmtFull(d.data.total)}</div>
           <div class="tip-sub">${pct}% of total · ${d.data.count} item${d.data.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`);
      })
      .on('mousemove', (event, d) => {
        const pct = ((d.data.total / total) * 100).toFixed(1);
        tooltip.show(event,
          `<div class="tip-cat">${d.data.info.icon} ${d.data.info.label}</div>
           <div class="tip-val">${fmtFull(d.data.total)}</div>
           <div class="tip-sub">${pct}% of total · ${d.data.count} item${d.data.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).interrupt().transition().duration(120).attr('d', arc);
        tooltip.hide();
      });

    // Center label
    g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '-0.2em')
      .attr('fill', '#ffc627').attr('font-size', `${size * 0.07}px`).attr('font-weight', '800')
      .text(fmt(total));
    g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '1.1em')
      .attr('fill', 'rgba(255,255,255,0.35)').attr('font-size', `${size * 0.045}px`)
      .text(isDemo ? 'sample' : 'total');
  }, [data, isDemo]);

  return <svg ref={svgRef} className="analytics-svg" />;
}

// ─── Trend Line Chart ─────────────────────────────────────────────────────────
function TrendChart({ data, tooltip, isDemo }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 500;
    const H = 160;
    const m = { top: 14, right: 20, bottom: 38, left: 54 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    if (data.length < 2) {
      svg.append('text')
        .attr('x', W / 2).attr('y', H / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.25)').attr('font-size', '0.8rem')
        .text(data.length === 0 ? 'No data' : 'Need ≥2 months for trend');
      return;
    }

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const x = d3.scalePoint().domain(data.map(d => d.month)).range([0, w]).padding(0.3);
    const maxVal = d3.max(data, d => d.total) || 1;
    const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([h, 0]);

    // Grid
    g.append('g').selectAll('line').data(y.ticks(3)).join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(255,255,255,0.06)').attr('stroke-dasharray', '3,3');

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(monthLabel).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.12)'))
      .call(ax => ax.selectAll('text')
        .attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '0.65rem').attr('dy', '1.2em'));

    // Y axis
    g.append('g').call(d3.axisLeft(y).ticks(3).tickFormat(fmt).tickSize(0))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', 'rgba(255,255,255,0.35)').attr('font-size', '0.65rem'));

    // Gradient def
    const defs = svg.append('defs');
    const gradId = isDemo ? 'areaGradDemo' : 'areaGrad';
    const grad = defs.append('linearGradient').attr('id', gradId)
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#8c1d40').attr('stop-opacity', isDemo ? 0.25 : 0.4);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#8c1d40').attr('stop-opacity', 0.02);

    // Area fill
    const area = d3.area()
      .x(d => x(d.month)).y0(h).y1(d => y(d.total))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path').datum(data)
      .attr('fill', `url(#${gradId})`)
      .attr('d', area);

    // Line
    const line = d3.line()
      .x(d => x(d.month)).y(d => y(d.total))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = g.append('path').datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ffc627')
      .attr('stroke-width', 2.2)
      .attr('stroke-opacity', isDemo ? 0.65 : 1)
      .attr('d', line);

    // Animate line draw (slower + delayed in demo mode for extra drama)
    const len = path.node().getTotalLength();
    path.attr('stroke-dasharray', `${len} ${len}`)
        .attr('stroke-dashoffset', len)
      .transition().delay(isDemo ? 300 : 0).duration(isDemo ? 1000 : 700).ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

    // Dots (fade in after line draws)
    const dots = g.selectAll('.dot').data(data).join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.month))
      .attr('cy', d => y(d.total))
      .attr('r', 0)
      .attr('fill', '#ffc627')
      .attr('stroke', '#160722')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    dots.transition()
      .delay((_, i) => (isDemo ? 300 : 0) + 700 + i * 60)
      .duration(250).ease(d3.easeCubicOut)
      .attr('r', 4);

    dots.on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(100).attr('r', 7);
        tooltip.show(event,
          `<div class="tip-month">${monthLabel(d.month)}</div>
           <div class="tip-val">${fmtFull(d.total)}</div>
           <div class="tip-sub">${d.count} transaction${d.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`);
      })
      .on('mousemove', (event, d) => tooltip.show(event,
          `<div class="tip-month">${monthLabel(d.month)}</div>
           <div class="tip-val">${fmtFull(d.total)}</div>
           <div class="tip-sub">${d.count} transaction${d.count !== 1 ? 's' : ''}${isDemo ? ' · sample' : ''}</div>`))
      .on('mouseleave', function() {
        d3.select(this).transition().duration(100).attr('r', 4);
        tooltip.hide();
      });
  }, [data, isDemo]);

  return <svg ref={svgRef} className="analytics-svg" />;
}

// ─── Main Analytics Component ─────────────────────────────────────────────────
export default function Analytics() {
  const { expenses } = useExpenses();
  const [selectedCat, setSelectedCat] = useState('all');
  const [timeRange,   setTimeRange]   = useState('6months');
  const tooltip = useTooltip();

  const isDemoMode = expenses.length === 0;

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = expenses;
    const now = new Date();
    if (timeRange === '3months') {
      const cut = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      data = data.filter(e => new Date(e.date + 'T00:00:00') >= cut);
    } else if (timeRange === '6months') {
      const cut = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      data = data.filter(e => new Date(e.date + 'T00:00:00') >= cut);
    } else if (timeRange === 'year') {
      data = data.filter(e => new Date(e.date + 'T00:00:00').getFullYear() === now.getFullYear());
    }
    if (selectedCat !== 'all') data = data.filter(e => e.category === selectedCat);
    return data;
  }, [expenses, selectedCat, timeRange]);

  // ── Monthly aggregation ──────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const k = toMonthKey(e.date);
      if (!map[k]) map[k] = { month: k, total: 0, count: 0 };
      map[k].total += e.amount;
      map[k].count++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // ── Category aggregation ─────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
      map[e.category].total += e.amount;
      map[e.category].count++;
    });
    return Object.entries(map)
      .map(([cat, v]) => ({ category: cat, ...v, info: CAT_MAP[cat] || { label: cat, icon: '?', color: '#888' } }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  // ── Summary stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = d3.sum(filtered, d => d.amount);
    const months   = monthlyData.length || 1;
    const avgMonth = total / months;
    const top      = categoryData[0];
    return { total, avgMonth, topCat: top?.info?.label ?? '—', topIcon: top?.info?.icon ?? '', count: filtered.length };
  }, [filtered, monthlyData, categoryData]);

  // ── Use demo data when no real expenses ──────────────────────────────────────
  const activeMonthly  = isDemoMode ? DEMO_MONTHLY  : monthlyData;
  const activeCategory = isDemoMode ? DEMO_CATEGORY : categoryData;
  const activeStats    = isDemoMode ? DEMO_STATS    : stats;

  return (
    <section className="analytics" aria-label="Spending Analytics">
      {/* Shared tooltip DOM node */}
      <div ref={tooltip.ref} className="analytics-tooltip" style={{ display: 'none' }} />

      {/* ── Header + Filters ── */}
      <div className="analytics__header">
        <div className="analytics__title-block">
          <span className="analytics__icon">📊</span>
          <h2 className="analytics__title">Spending Analytics</h2>
          {isDemoMode && <span className="analytics__demo-badge">PREVIEW</span>}
        </div>
        <div className={`analytics__filters ${isDemoMode ? 'analytics__filters--demo' : ''}`}>
          <select
            className="analytics__select"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            disabled={isDemoMode}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            className="analytics__select"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            disabled={isDemoMode}
            aria-label="Select time range"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* ── Demo Banner ── */}
      {isDemoMode && (
        <div className="analytics__demo-banner" role="status">
          <div className="analytics__demo-banner-left">
            <span className="analytics__demo-icon">✨</span>
            <div>
              <div className="analytics__demo-title">Sample Data Preview</div>
              <div className="analytics__demo-sub">Add your first expense above to see your actual analytics here.</div>
            </div>
          </div>
          <div className="analytics__demo-cta">↑ Add Expense</div>
        </div>
      )}

      {/* ── Summary Stats Row ── */}
      <div className="analytics__stats">
        <div className="analytics__stat">
          <span className="analytics__stat-val">{fmtFull(activeStats.total)}</span>
          <span className="analytics__stat-label">Total Spent</span>
        </div>
        <div className="analytics__stat">
          <span className="analytics__stat-val">{fmtFull(activeStats.avgMonth)}</span>
          <span className="analytics__stat-label">Avg / Month</span>
        </div>
        <div className="analytics__stat">
          <span className="analytics__stat-val">{activeStats.topIcon} {activeStats.topCat}</span>
          <span className="analytics__stat-label">Top Category</span>
        </div>
        <div className="analytics__stat">
          <span className="analytics__stat-val">{activeStats.count}</span>
          <span className="analytics__stat-label">Transactions</span>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="analytics__charts">

        {/* Monthly bar */}
        <div className="analytics__card analytics__card--bar">
          <div className="analytics__card-header">
            <span className="analytics__card-title">Monthly Spending</span>
            <span className="analytics__card-hint">{isDemoMode ? 'sample data' : 'hover for details'}</span>
          </div>
          <div className="analytics__chart-wrap">
            <BarChart data={activeMonthly} tooltip={tooltip} isDemo={isDemoMode} />
          </div>
        </div>

        {/* Donut + legend row */}
        <div className="analytics__card-row">
          <div className="analytics__card analytics__card--donut">
            <div className="analytics__card-header">
              <span className="analytics__card-title">By Category</span>
              <span className="analytics__card-hint">{isDemoMode ? 'sample data' : 'hover for details'}</span>
            </div>
            <div className="analytics__donut-wrap">
              <div className="analytics__chart-wrap analytics__chart-wrap--donut">
                <DonutChart data={activeCategory} tooltip={tooltip} isDemo={isDemoMode} />
              </div>
              {/* Legend */}
              <div className="analytics__legend">
                {activeCategory.map(d => {
                  const total = d3.sum(activeCategory, c => c.total);
                  const pct = total ? ((d.total / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={d.category} className="analytics__legend-item">
                      <span className="analytics__legend-dot" style={{ background: d.info.color }} />
                      <span className="analytics__legend-label">{d.info.icon} {d.info.label}</span>
                      <span className="analytics__legend-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trend line */}
          <div className="analytics__card analytics__card--trend">
            <div className="analytics__card-header">
              <span className="analytics__card-title">Spending Trend</span>
              <span className="analytics__card-hint">{isDemoMode ? 'sample data' : 'hover dots'}</span>
            </div>
            <div className="analytics__chart-wrap">
              <TrendChart data={activeMonthly} tooltip={tooltip} isDemo={isDemoMode} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
