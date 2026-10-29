/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enterprise VIP Admin Styling System
 * Refined dark industrial executive aesthetic:
 * - Application Background: #090B10 (near-black charcoal)
 * - Sidebar Background: #0D1118 (deep graphite)
 * - Main Card Surface: #121823 (refined charcoal-blue)
 * - Elevated Surface: #18212D (elevated industrial slate)
 * - Borders: #273244 (subtle industrial blue-gray)
 * - Primary Accent: #22D3EE (electric cyan)
 * - Secondary Accent: #F5A623 (industrial amber)
 */
export const adminStyles = {
  // Shell & Layout surfaces
  appBg: 'bg-[#090B10]',
  sidebarBg: 'bg-[#0D1118]',
  headerBg: 'bg-[#0D1118]/95 backdrop-blur-md',
  
  // Card & Container surfaces
  card: 'bg-[#121823] border border-[#273244] rounded-xl p-5 shadow-lg shadow-black/40',
  cardHover: 'hover:border-[#22D3EE]/40 transition-all duration-200',
  elevatedCard: 'bg-[#18212D] border border-[#273244] rounded-xl p-5 shadow-xl shadow-black/50',
  cardHeader: 'border-b border-[#273244] pb-3.5 mb-4 flex items-center justify-between',

  // Interactive buttons
  btnPrimary: 'px-4 py-2 rounded-lg bg-gradient-to-r from-[#22D3EE] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0369A1] text-slate-950 font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_18px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center shrink-0',
  btnSecondary: 'px-4 py-2 rounded-lg bg-[#18212D] border border-[#273244] hover:border-[#22D3EE]/50 hover:bg-[#1E293B] text-slate-200 hover:text-white font-mono text-xs transition-all flex items-center gap-2 justify-center shrink-0',
  btnDanger: 'px-4 py-2 rounded-lg bg-red-950/40 border border-red-500/30 hover:border-red-500 hover:bg-red-900/40 text-red-300 font-mono text-xs transition-all flex items-center gap-2 justify-center shrink-0',
  btnAmber: 'px-4 py-2 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/40 hover:bg-[#F5A623]/20 text-[#F5A623] font-mono font-bold text-xs transition-all flex items-center gap-2 justify-center shrink-0',

  // Tables
  tableWrapper: 'overflow-x-auto custom-scrollbar rounded-xl border border-[#273244] bg-[#121823]',
  tableHeader: 'bg-[#0D1118] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-[#273244]',
  tableHeaderCell: 'px-5 py-3.5',
  tableRow: 'hover:bg-[#18212D]/80 transition-colors border-b border-[#273244]/60 text-xs font-mono text-slate-200',
  tableCell: 'px-5 py-3.5',

  // Form inputs
  input: 'w-full px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 placeholder-slate-500 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none font-mono text-xs transition-all',
  select: 'px-3.5 py-2 rounded-lg bg-[#090B10] border border-[#273244] text-slate-100 focus:border-[#22D3EE] focus:outline-none font-mono text-xs transition-all',

  // Status pills
  badgeBase: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider border',
  badgeSuccess: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
  badgeWarning: 'bg-amber-950/50 text-amber-300 border-amber-500/30',
  badgeError: 'bg-red-950/50 text-red-400 border-red-500/30',
  badgeInfo: 'bg-cyan-950/50 text-[#22D3EE] border-[#22D3EE]/30',
  badgeVip: 'bg-gradient-to-r from-amber-500/15 to-cyan-500/15 text-amber-300 border-[#F5A623]/40 shadow-[0_0_10px_rgba(245,166,35,0.15)]',

  // Typography helpers
  pageTitle: 'text-2xl font-bold font-mono text-slate-100 tracking-tight',
  sectionTitle: 'text-sm font-bold font-mono text-slate-200 uppercase tracking-wider',
  metadataLabel: 'text-[11px] font-mono text-slate-400 uppercase tracking-wider',
  metadataValue: 'text-xs font-mono text-slate-200',
  kpiValue: 'text-2xl lg:text-3xl font-extrabold font-mono text-slate-100 tracking-tight',
} as const;
