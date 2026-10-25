/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer, SectionHeading } from '../components/ui/Base';
import { Breadcrumbs } from '../components/ui/Display';
import { CategoryCard } from '../components/ui/Cards';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { SEO } from '../components/common/SEO';
import { ChevronRight, ArrowRight, ShieldCheck, ToggleLeft, Cable, Box, Cpu, Zap, Lightbulb, Radio } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'circuit-protection': <ShieldCheck className="w-5 h-5 text-teal" />,
  'switches-sockets': <ToggleLeft className="w-5 h-5 text-teal" />,
  'cables-wires': <Cable className="w-5 h-5 text-teal" />,
  'conduits-management': <Box className="w-5 h-5 text-teal" />,
  'industrial-automation': <Cpu className="w-5 h-5 text-teal" />,
  'panels-distribution': <Zap className="w-5 h-5 text-teal" />,
  'lighting': <Lightbulb className="w-5 h-5 text-teal" />,
  'earthing-lightning': <Radio className="w-5 h-5 text-teal" />,
};

const CATEGORY_IMAGES: Record<string, string> = {
  'circuit-protection': '/assets/images/industrial_circuit_breaker_1792848534487.jpg',
  'switches-sockets': '/assets/images/app_commercial_construction_1792851606559.jpg',
  'cables-wires': '/assets/images/industrial_cable_reel_1792848534820.jpg',
  'conduits-management': '/assets/images/industrial_category_distribution_1792848535201.jpg',
  'industrial-automation': '/assets/images/cat_industrial_automation_1792851607023.jpg',
  'panels-distribution': '/assets/images/app_manufacturing_systems_1792851607363.jpg',
  'lighting': '/assets/images/prod_led_floodlight_1792851607088.jpg',
  'earthing-lightning': '/assets/images/homepage_hero_industrial_1792851605594.jpg',
  'safety-fire': '/assets/images/app_commercial_construction_1792851606559.jpg',
  'security': '/assets/images/cat_industrial_automation_1792851607023.jpg',
  'renewables': '/assets/images/industrial_cable_reel_1792848534820.jpg',
  'test-instruments': '/assets/images/prod_industrial_plc_1792851607627.jpg',
  'industrial-tools': '/assets/images/app_manufacturing_systems_1792851607363.jpg',
  'transformers': '/assets/images/industrial_circuit_breaker_1792848534487.jpg',
  'ups-protection': '/assets/images/industrial_category_distribution_1792848535201.jpg',
  'e-mobility': '/assets/images/prod_led_floodlight_1792851607088.jpg',
  'clearance': '/assets/images/homepage_hero_industrial_1792851605594.jpg',
};

export const CategoryDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' }
  ];

  const activeCategory = CATEGORIES.find(c => c.id === selectedTab);

  return (
    <PageContainer>
      <SEO 
        title="All Categories & Subcategories Directory | Industrial Electrical"
        description="Comprehensive directory of industrial switchgear, circuit protection, motor controls, power distribution, and industrial wiring accessories."
      />
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <SectionHeading 
          title="All Categories" 
          subtitle="Explore all industrial electrical departments, technical subcategories, and equipment ranges."
          className="mb-0"
        />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          {CATEGORIES.length} Major Divisions
        </span>
      </div>

      {/* Responsive Category Tabs Bar */}
      <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-2 sm:p-3 mb-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div 
          role="tablist" 
          aria-label="Category Selection Tabs"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0"
        >
          <button
            role="tab"
            aria-selected={selectedTab === 'all'}
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              selectedTab === 'all'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-black'
                : 'text-slate-400 hover:text-white hover:bg-cyan-950/30'
            }`}
          >
            All Departments
          </button>
          
          {CATEGORIES.map((category) => {
            const isSelected = selectedTab === category.id;
            return (
              <button
                key={category.id}
                role="tab"
                id={`cat-tab-${category.id}`}
                aria-selected={isSelected}
                onClick={() => setSelectedTab(category.id)}
                className={`px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-black'
                    : 'text-slate-400 hover:text-white hover:bg-cyan-950/30'
                }`}
              >
                <span>{category.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-cyan-950/50 text-cyan-400'
                }`}>
                  {category.subcategories?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* If a specific category tab is selected, show its Child Subcategories Tab View */}
      {activeCategory ? (
        <div className="bg-[#0b0f19]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 lg:p-10 mb-12 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-500/30 text-cyan-400 shrink-0">
                {CATEGORY_ICONS[activeCategory.id] || <Box className="w-6 h-6 text-cyan-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono text-glow-cyan">Department Child Tab</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{activeCategory.subcategories?.length || 0} Subcategories</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{activeCategory.name}</h3>
              </div>
            </div>

            <Link
              to={`/categories/${activeCategory.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 self-start sm:self-auto"
            >
              Browse All {activeCategory.name} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Child Subcategories & Product Lines:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCategory.subcategories?.map((sub: any) => (
              <Link
                key={sub.id}
                to={`/categories/${sub.slug}`}
                className="group p-4 rounded-xl border border-cyan-500/20 bg-[#07090e] hover:bg-[#0b0f19] hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all flex items-center justify-between gap-3 industrial-card-3d"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {sub.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 group-hover:text-slate-200 transition-colors flex items-center gap-1 font-mono">
                    <span>View specifications</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Overview Departments Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {selectedTab === 'all' ? 'All Industrial Departments' : 'All Departments Overview'}
          </h2>
          <button 
            onClick={() => setSelectedTab('all')}
            className="text-xs font-bold text-cyan-400 hover:underline hover:text-cyan-300 font-mono"
          >
            Show All Grid
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in zoom-in duration-500">
          {CATEGORIES.map(category => (
            <div key={category.id} className="flex flex-col rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0b0f19]/90 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-cyan-400/60 transition-all industrial-card-3d">
              <Link to={`/categories/${category.slug}`} className="focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <CategoryCard 
                  name={category.name} 
                  count={PRODUCTS.filter(p => p.categoryId === category.id || (category.subcategories?.some((sc: any) => sc.id === p.categoryId))).length} 
                  image={CATEGORY_IMAGES[category.id] || '/assets/images/industrial_category_distribution_1792848535201.jpg'}
                />
              </Link>

              {/* Responsive child list preview */}
              <div className="p-4 bg-[#07090e]/50 border-t border-cyan-500/20 flex flex-col gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Popular Subcategories:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {category.subcategories?.slice(0, 4).map((sub: any) => (
                    <Link
                      key={sub.id}
                      to={`/categories/${sub.slug}`}
                      className="px-2 py-1 bg-[#0b0f19] border border-cyan-500/20 rounded text-[11px] text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors font-mono"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  {(category.subcategories?.length || 0) > 4 && (
                    <button
                      onClick={() => setSelectedTab(category.id)}
                      className="px-2 py-1 bg-cyan-950/50 text-cyan-400 rounded text-[11px] font-bold hover:bg-cyan-950/80 transition-colors font-mono"
                    >
                      +{(category.subcategories?.length || 0) - 4} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

