/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  History,
  Search,
  Filter,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Box
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { Product, StockMovement } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const VIPInventoryDashboard: React.FC = () => {
  const { isAdmin, isOwner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [{ products: allProducts, isLive: live }, recentMovements] = await Promise.all([
        productService.getProducts(),
        inventoryService.getRecentMovements(10)
      ]);
      
      setProducts(allProducts);
      setMovements(recentMovements);
      setIsLive(live);
    } catch (err) {
      console.error('Failed to fetch inventory dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Stats
  const totalProducts = products.length;
  const trackInventoryCount = products.filter(p => p.trackInventory).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => p.trackInventory && (p.stock || 0) <= (p.lowStockThreshold || 0) && (p.stock || 0) > 0);
  const outOfStockProducts = products.filter(p => p.trackInventory && (p.stock || 0) <= 0);
  
  const totalValuation = isOwner || isAdmin 
    ? products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.stock || 0)), 0)
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#273244] border-t-[#22D3EE] animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">Aggregating Inventory Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight uppercase">Inventory & Logistics</h1>
            {!isLive && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                SAMPLE DATA
              </span>
            )}
            {isLive && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 font-mono">Centralized stock management and movement auditing</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#121823] border border-[#273244] text-slate-400 hover:text-[#22D3EE] transition-all disabled:opacity-50"
            title="Refresh Intelligence"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18212D] border border-[#273244] text-slate-200 text-xs font-mono hover:border-[#22D3EE] transition-all"
          >
            <Box className="w-4 h-4 text-[#22D3EE]" />
            <span>Product Catalog</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Tracked SKU Units" 
          value={totalStockUnits.toLocaleString()} 
          icon={Package} 
          color="blue"
          subValue={`${trackInventoryCount} items monitored`}
        />
        <StatCard 
          label="Low Stock Alert" 
          value={lowStockProducts.length.toString()} 
          icon={AlertTriangle} 
          color="amber"
          subValue="Action required"
          trend={lowStockProducts.length > 0 ? 'down' : 'up'}
        />
        <StatCard 
          label="Out of Stock" 
          value={outOfStockProducts.length.toString()} 
          icon={TrendingDown} 
          color="red"
          subValue="Critical replenishment"
        />
        <StatCard 
          label="Inventory Valuation" 
          value={totalValuation !== null ? `$${totalValuation.toLocaleString()}` : 'RESTRICTED'} 
          icon={BarChart3} 
          color="emerald"
          subValue="Aggregate cost basis"
          restricted={totalValuation === null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Replenishment Queue
            </h2>
          </div>
          
          <div className="bg-[#0D1118] border border-[#273244] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121823]/50 border-b border-[#273244]">
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Product</th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">In Stock</th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">Threshold</th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#273244]">
                  {lowStockProducts.concat(outOfStockProducts).slice(0, 8).map((product) => (
                    <tr key={product.id} className="hover:bg-[#121823]/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#18212D] border border-[#273244] flex-shrink-0 flex items-center justify-center group-hover:border-[#22D3EE]/30 transition-colors">
                            <Package className="w-4 h-4 text-slate-500 group-hover:text-[#22D3EE]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{product.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 uppercase">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono font-bold ${(product.stock || 0) <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">
                        {product.lowStockThreshold || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link 
                          to={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-lg bg-[#18212D] border border-[#273244] text-slate-400 hover:text-[#22D3EE] hover:border-[#22D3EE]/50 transition-all inline-flex"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(lowStockProducts.length === 0 && outOfStockProducts.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <ShieldCheck className="w-8 h-8 text-emerald-500" />
                          <p className="text-xs font-mono text-slate-400">All stock levels within nominal operational parameters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {(lowStockProducts.length > 8 || outOfStockProducts.length > 8) && (
              <div className="px-4 py-3 bg-[#121823]/30 border-t border-[#273244] text-center">
                <Link to="/admin/products" className="text-[10px] font-mono font-bold text-[#22D3EE] hover:underline uppercase tracking-widest">
                  View full replenishment list
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4 text-[#22D3EE]" />
            Audit Ledger
          </h2>
          <div className="bg-[#0D1118] border border-[#273244] rounded-2xl overflow-hidden divide-y divide-[#273244]">
            {movements.map((movement) => (
              <div key={movement.id} className="p-4 hover:bg-[#121823]/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${
                      movement.quantityChange > 0 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {movement.quantityChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase truncate block">
                        {movement.sku}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-500">{movement.previousQuantity}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                        <span className="text-[9px] font-mono text-slate-200 font-bold">{movement.newQuantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${movement.quantityChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mb-2 italic">"{movement.reason}"</p>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span className="uppercase">{movement.movementType.replace(/_/g, ' ')}</span>
                  <span>{new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {movements.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-[10px] font-mono text-slate-500 uppercase italic">No recent movements recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  icon: any; 
  color: 'blue' | 'amber' | 'red' | 'emerald';
  subValue: string;
  trend?: 'up' | 'down';
  restricted?: boolean;
}> = ({ label, value, icon: Icon, color, subValue, trend, restricted }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0D1118] border border-[#273244] hover:border-[#22D3EE]/30 transition-all group shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-black tracking-tight ${restricted ? 'text-slate-600' : 'text-slate-100'}`}>{value}</h3>
        </div>
        <p className="text-[10px] text-slate-400 font-mono tracking-tight">{subValue}</p>
      </div>
    </div>
  );
};
