import React from 'react';
import { ShoppingCart, Heart, FileText, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriceDisplay } from './Display';
import { Badge } from './Display';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

// --- Product Card ---

export interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, isNew 
}) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const { id, name, categoryId: category, price, images, sku, brandId } = product;
  const image = images?.[0] || '/src/assets/images/industrial_circuit_breaker_1792848534487.jpg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id);
  };

  const isSaved = isInWishlist(id);

  return (
    <div className="group bg-navy/80 border border-border hover:border-teal/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col h-full relative backdrop-blur-md industrial-card-3d">
      <div className="relative aspect-square overflow-hidden bg-navy-dark/90 p-6 flex items-center justify-center border-b border-border/80">
        <img 
          src={image} 
          alt={name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/industrial_circuit_breaker_1792848534487.jpg';
          }}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108 filter drop-shadow-[0_4px_12px_rgba(0,240,255,0.15)] animate-float-gentle"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="bg-teal text-black text-[9px] uppercase font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              FEATURED
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-10">
          <button 
            onClick={handleWishlist}
            aria-label={isSaved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
            className={`p-2 bg-navy/90 rounded-lg shadow-sm border border-border hover:border-teal transition-colors cursor-pointer ${isSaved ? 'text-magenta-neon border-magenta-neon/50' : 'text-text-muted hover:text-teal'}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow bg-navy/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold text-teal uppercase tracking-widest font-mono truncate">{category}</span>
          {sku && <span className="text-[9px] font-mono text-text-muted shrink-0">SKU: {sku}</span>}
        </div>

        <h3 className="text-xs sm:text-sm font-bold text-white mb-3 line-clamp-2 group-hover:text-teal transition-colors min-h-[38px] leading-snug">
          <Link to={`/products/${id}`} className="hover:underline">{name}</Link>
        </h3>

        <div className="mt-auto pt-3 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <PriceDisplay amount={price} size="md" className="text-teal font-extrabold font-mono" />
            <div className="text-[9px] font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded border border-success/30">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span>IN STOCK</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            <button 
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
              className="col-span-4 py-2 px-3 bg-teal text-black rounded-lg text-xs font-extrabold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal truncate flex items-center justify-center gap-1.5 cursor-pointer industrial-btn-glow"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
            <Link 
              to={`/bulk-quote`}
              title="Request Quote"
              aria-label={`Request quote for ${name}`}
              className="col-span-1 flex items-center justify-center border border-border rounded-lg hover:border-teal hover:bg-teal/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal text-text-secondary hover:text-teal"
            >
              <FileText className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Category Card ---

export const CategoryCard: React.FC<{ 
  name: string; 
  count: number; 
  image: string; 
  onClick?: () => void;
}> = ({ name, count, image, onClick }) => (
  <div 
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    className="group relative h-48 sm:h-56 lg:h-60 rounded-xl overflow-hidden cursor-pointer border border-border hover:border-teal/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] focus:outline-none focus:ring-2 focus:ring-teal industrial-card-3d"
  >
    <img 
      src={image} 
      alt={name}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-75 group-hover:brightness-90 animate-float-gentle"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy/60 to-transparent" />
    <div className="absolute bottom-0 left-0 p-5 sm:p-6 text-white w-full">
      <div className="text-[10px] font-mono text-teal uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-teal" />
        <span>{count} SPECS AVAILABLE</span>
      </div>
      <h3 className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-teal transition-colors line-clamp-1 flex items-center justify-between">
        <span>{name}</span>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal" />
      </h3>
    </div>
  </div>
);

// --- Brand Tile ---

export const BrandTile: React.FC<{ name: string; logo: string; onClick?: () => void }> = ({ name, logo, onClick }) => (
  <div 
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    className="flex flex-col items-center gap-2"
  >
    <div className="bg-navy/80 border border-border hover:border-violet-neon/50 rounded-xl p-4 flex items-center justify-center transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(138,43,226,0.25)] h-24 sm:h-28 w-full focus:outline-none focus:ring-2 focus:ring-teal industrial-card-3d">
      <img 
        src={logo} 
        alt={`${name} brand logo`} 
        loading="lazy"
        decoding="async"
        className="max-w-full max-h-full object-contain filter brightness-90 group-hover:brightness-100" 
      />
    </div>
    <span className="text-xs font-bold text-slate-300 text-center">{name}</span>
  </div>
);

// --- Specification Table ---

export const SpecificationTable: React.FC<{ specs: Record<string, string> }> = ({ specs }) => (
  <div className="border border-border rounded-xl overflow-hidden bg-navy/80 shadow-md backdrop-blur-md">
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-xs sm:text-sm text-left border-collapse">
        <tbody>
          {Object.entries(specs).map(([key, value], idx) => (
            <tr key={key} className={`border-b border-border/60 last:border-0 ${idx % 2 === 0 ? 'bg-navy/90' : 'bg-navy-dark/60'}`}>
              <th scope="row" className="px-4 py-3 font-semibold text-text-primary border-r border-border/60 w-1/3 min-w-[130px]">
                {key}
              </th>
              <td className="px-4 py-3 text-teal font-mono text-xs font-bold">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


