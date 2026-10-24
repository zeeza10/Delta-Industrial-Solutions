import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer, PrimaryButton, SecondaryButton, SectionHeading } from '../components/ui/Base';
import { Breadcrumbs, PriceDisplay, Badge } from '../components/ui/Display';
import { SpecificationTable, ProductCard } from '../components/ui/Cards';
import { QuantitySelector } from '../components/ui/Forms';
import { PRODUCTS } from '../data/products';
import { BRANDS } from '../data/brands';
import { CATEGORIES } from '../data/categories';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, ClipboardList, FileText, ShieldCheck, Truck } from 'lucide-react';
import { EmptyState } from '../components/ui/States';
import { getProductBySlug, getCategories, getBrands } from '../utils/dbQueries';
import { Product, Brand, Category } from '../types';
import { SEO } from '../components/common/SEO';
import { Product3DViewer } from '../components/3d/Product3DViewer';
import { generateQuotationPDF } from '../utils/pdfExport';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, addToQuote, toggleWishlist, isInWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const p = await getProductBySlug(id);
        if (p) {
          setProduct(p);
          const brands = await getBrands();
          const b = brands.find(brand => brand.id === p.brandId);
          if (b) setBrand(b);
          const categories = await getCategories();
          const c = categories.find(cat => cat.id === p.categoryId);
          if (c) setCategory(c);
          setRelatedProducts(PRODUCTS.filter(item => item.categoryId === p.categoryId && item.id !== p.id).slice(0, 4));
        } else {
          // Demo Fallback
          const localProduct = PRODUCTS.find(p => p.id === id || p.slug === id);
          if (localProduct) {
            setProduct(localProduct);
            const b = BRANDS.find(b => b.id === localProduct.brandId);
            if (b) setBrand(b);
            const c = CATEGORIES.find(c => c.id === localProduct.categoryId) || 
                      CATEGORIES.flatMap(c => c.subcategories || []).find(sc => sc.id === localProduct.categoryId);
            if (c) setCategory(c as any);
            setRelatedProducts(PRODUCTS.filter(p => p.categoryId === localProduct.categoryId && p.id !== localProduct.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading product details"></div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <SEO title="Product Not Found" description="The requested industrial product could not be found." />
        <EmptyState 
          title="Product Not Found" 
          message="The product you are looking for does not exist or has been removed." 
          action={<Link to="/products"><PrimaryButton>Browse All Products</PrimaryButton></Link>}
        />
      </PageContainer>
    );
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: category?.name || 'Category', path: category ? `/categories/${category.slug}` : '#' },
    { label: product.name, path: '#' }
  ];

  // Rich JSON-LD Schemas for SEO
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": product.description,
      "sku": product.sku,
      "brand": {
        "@type": "Brand",
        "name": brand?.name || 'Delta Industrial'
      },
      "offers": {
        "@type": "Offer",
        "url": typeof window !== 'undefined' ? window.location.href : '',
        "priceCurrency": "USD",
        "price": product.price,
        "availability": product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": crumb.label,
        "item": crumb.path.startsWith('http') ? crumb.path : `${typeof window !== 'undefined' ? window.location.origin : ''}${crumb.path}`
      }))
    }
  ];

  return (
    <PageContainer>
      <SEO 
        title={`${product.name} | ${brand?.name || 'Delta Industrial'}`}
        description={`${product.description.slice(0, 150)}... SKU: ${product.sku}. Genuine industrial quality guaranteed.`}
        ogType="product"
        ogImage={product.images[0]}
        structuredData={structuredData}
      />

      <Breadcrumbs items={breadcrumbs} className="mb-6 lg:mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-20">
        {/* Left: 3D Product Viewer */}
        <div className="space-y-4">
          <Product3DViewer productName={product.name} image={product.images[activeImage]} />
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View ${product.name} image thumbnail ${idx + 1}`}
                  className={`aspect-square border-2 rounded-xl p-2 bg-navy transition-all focus:outline-none focus:ring-2 focus:ring-teal cursor-pointer ${activeImage === idx ? 'border-teal shadow-[0_0_12px_rgba(0,240,255,0.3)]' : 'border-border hover:border-border-glow'}`}
                >
                  <img 
                    src={img} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between gap-4">
              {brand ? (
                <Link to={`/brands/${brand.slug}`} className="text-xs sm:text-sm font-bold text-teal uppercase tracking-widest hover:underline">
                  {brand.name}
                </Link>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-text-secondary uppercase tracking-widest">
                  Delta Industrial
                </span>
              )}
              <Badge variant={product.isAvailable ? 'success' : 'error'}>
                {product.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-text-muted pt-1">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span>MPN: {product.sku}</span>
              {category && (
                <>
                  <span>•</span>
                  <span className="text-teal font-semibold">{category.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-navy/80 border border-border-glow rounded-2xl mb-8 shadow-xl backdrop-blur-md">
            <div className="mb-6">
              <div className="text-xs font-mono font-bold text-text-muted uppercase tracking-widest mb-1">List Price</div>
              <PriceDisplay amount={product.price} size="xl" className="text-teal font-black font-mono text-glow-cyan" />
              <div className="text-[10px] text-text-muted mt-1 uppercase font-bold font-mono">Excluding VAT & International Freight</div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="space-y-1.5 shrink-0">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">Quantity</label>
                  <QuantitySelector value={quantity} onChange={setQuantity} />
                </div>
                <PrimaryButton 
                  onClick={() => addToCart(product, quantity)}
                  className="w-full sm:flex-grow h-12 gap-3"
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                  aria-label={`Add ${quantity} units of ${product.name} to cart`}
                >
                  Add to Cart
                </PrimaryButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SecondaryButton 
                  onClick={() => addToQuote(product, quantity)}
                  className="h-12"
                  leftIcon={<ClipboardList className="w-5 h-5 text-teal" />}
                  aria-label={`Add ${product.name} to quote list`}
                >
                  Add to Quote
                </SecondaryButton>
                <SecondaryButton 
                  onClick={() => toggleWishlist(product.id)}
                  className={`h-12 transition-colors ${isInWishlist(product.id) ? 'text-magenta-neon border-magenta-neon/50 bg-magenta-neon/10' : ''}`}
                  leftIcon={<Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />}
                  aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                >
                  {isInWishlist(product.id) ? 'Saved' : 'Wishlist'}
                </SecondaryButton>
              </div>

              <SecondaryButton
                onClick={() => generateQuotationPDF([{ product, quantity }])}
                className="w-full h-12 text-xs uppercase tracking-wider gap-2 text-cyan-400 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10"
                leftIcon={<FileText className="w-4 h-4 text-cyan-400" />}
              >
                Download Quotation PDF
              </SecondaryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-6 border-y border-border mb-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">Manufacturer Warranty</h4>
                <p className="text-xs text-text-secondary">Official 12-month industrial guarantee.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-teal shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">Global Logistics</h4>
                <p className="text-xs text-text-secondary">Express procurement and dispatched tracking.</p>
              </div>
            </div>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">
            {product.description}
          </p>
        </div>
      </div>

      {/* Specifications & Documentation */}
      <div className="space-y-16 lg:space-y-20">
        <section>
          <SectionHeading title="Technical Specifications" subtitle="Verified engineering parameters for installation and compliance." />
          <div className="max-w-3xl">
            <SpecificationTable specs={product.specifications} />
          </div>
        </section>

        {product.tags?.includes('featured') && (
          <section className="bg-navy/5 p-6 sm:p-8 lg:p-12 rounded-xl border border-navy/10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-navy rounded-xl flex items-center justify-center text-white shrink-0">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">Technical Datasheet</h3>
                <p className="text-xs sm:text-sm text-text-secondary">Download complete engineering drawings, wiring diagrams, and certification ratings for this component.</p>
              </div>
              <PrimaryButton className="w-full md:w-auto h-12 px-8 bg-teal hover:bg-teal-hover border-0">Download PDF</PrimaryButton>
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section>
            <SectionHeading title="Related Products" subtitle="Complementary components frequently engineered together." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard 
                  key={p.id}
                  product={p}
                  isNew={p.tags?.includes('featured')}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};

