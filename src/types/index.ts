/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Enterprise Data Models
 * Centralized data contracts supporting B2B storefront & VIP Admin Control Center
 */

// --- Base Entity Contract ---
export interface BaseEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

// --- 5.1 Products ---
export interface TierPrice {
  minQuantity: number;
  unitPrice: number;
}

export interface Product extends BaseEntity {
  id: string; // Product requires explicit ID
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  categoryId: string;
  brandId: string;
  images: string[];
  specifications: Record<string, string>;
  stock: number;
  isAvailable: boolean;
  tags: string[];
  
  // Extended Enterprise Fields
  unitOfMeasure?: string; // e.g. "meter", "unit", "box", "spool"
  status?: 'active' | 'draft' | 'archived';
  tierPricing?: TierPrice[];
  costPrice?: number; // Sensitive financial field
  trackInventory?: boolean;
  lowStockThreshold?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- 5.2 Categories ---
export interface Category extends BaseEntity {
  id: string;
  name: string;
  slug: string;
  description?: string; // Optional for subcategories
  parentId?: string;
  image?: string;
  
  // Extended Enterprise Fields
  sortOrder?: number;
  status?: 'active' | 'inactive';
  seoTitle?: string;
  seoDescription?: string;
  subcategories?: Category[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  subcategories?: CategoryNode[];
}

// --- 5.3 Brands ---
export interface Brand extends BaseEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  
  // Extended Enterprise Fields
  website?: string;
  status?: 'active' | 'inactive';
  countryOfOrigin?: string;
  certifications?: string[];
}

// --- 5.4 Customers & User Profiles ---
export type UserRole = 
  | 'owner' 
  | 'super_admin' 
  | 'admin' 
  | 'manager' 
  | 'procurement_admin' 
  | 'catalog_manager' 
  | 'support_admin' 
  | 'staff' 
  | 'viewer' 
  | 'customer';

export type BusinessClassification = 
  | 'contractor' 
  | 'oem' 
  | 'distributor' 
  | 'reseller' 
  | 'end_user';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer extends BaseEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  taxId?: string;
  vatNumber?: string;
  phone?: string;
  address?: Address;
  shippingAddress?: Address;
  billingAddress?: Address;
  businessClassification?: BusinessClassification;
  status?: 'active' | 'suspended';
}

export interface UserProfile extends BaseEntity {
  uid: string; // Auth UID is primary key
  id?: string;
  email: string;
  displayName?: string;
  role: UserRole;
  company?: string;
  phone?: string;
  jobTitle?: string;
  taxId?: string;
  vatNumber?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  wishlist?: string[];
  status?: 'active' | 'suspended';
  businessClassification?: BusinessClassification;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Shopping & Cart Types ---
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface QuoteItem {
  productId: string;
  quantity: number;
  product: Product;
  notes?: string;
}

// --- 5.5 Orders & Order Items ---
export interface OrderItem {
  productId: string;
  skuAtPurchase: string;
  nameAtPurchase: string;
  unitPriceAtPurchase: number;
  currency: string;
  quantity: number;
  subtotal: number;
  specificationsSnapshot?: Record<string, string>;
}

export interface Order extends BaseEntity {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  billingAddress?: Address;
  status: 'draft' | 'submitted' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'authorized' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
  notes?: string;
}

// --- 5.6 Quotations & Enquiries ---
export interface EnquiryLineItem {
  description: string;
  quantity: string | number;
  brand?: string;
  targetUnitPrice?: number;
  notes?: string;
}

export interface Enquiry extends BaseEntity {
  id: string;
  userId?: string;
  customerId?: string;
  type: 'project' | 'cable' | 'bulk-quote' | 'bulk' | 'general' | 'quote';
  status: 'pending' | 'reviewing' | 'reviewed' | 'quoted' | 'responded' | 'closed';
  subject?: string;
  message?: string;
  customerInfo: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    region?: string;
  };
  data: Record<string, any>;
  assignedStaffUid?: string;
}

export interface FormalQuotation extends BaseEntity {
  id: string;
  quotationNumber: string;
  enquiryId?: string;
  userId: string;
  customerEmail: string;
  companyName?: string;
  lines: EnquiryLineItem[];
  totalQuotedAmount: number;
  currency: string;
  validityDays: number;
  validUntil: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired';
  deliveryLeadTime?: string;
  paymentTerms?: string;
  assignedAdminUid: string;
  notes?: string;
}

// --- 5.7 Inventory & Stock Movements ---
export interface InventoryRecord extends BaseEntity {
  id: string;
  productId: string;
  sku: string;
  warehouseId?: string;
  availableStock: number;
  reservedStock: number;
  reorderThreshold: number;
  lastMovementId?: string;
}

export type StockMovementType = 
  | 'stock_received' 
  | 'stock_issued' 
  | 'manual_adjustment' 
  | 'order_reservation' 
  | 'order_cancellation_release' 
  | 'return_restock' 
  | 'transfer'
  | 'audit_adjustment'; // Keeping this for backward compatibility if any exists

export interface StockMovement {
  id: string;
  productId: string;
  sku: string;
  warehouseId?: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  movementType: StockMovementType;
  reason: string;
  recordedByUid: string;
  recordedByRole: string;
  timestamp: string;
}

// --- 5.8 Procurement ---
export interface Supplier extends BaseEntity {
  id: string;
  companyName: string;
  slug: string;
  contactPerson: string;
  contactEmail: string;
  phone?: string;
  taxId?: string;
  rating?: number;
  suppliedCategoryIds?: string[];
  status: 'active' | 'inactive';
  paymentTerms?: string;
}

export interface PurchaseOrderLine {
  productId?: string;
  sku: string;
  description: string;
  quantityOrdered: number;
  quantityReceived: number;
  agreedUnitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder extends BaseEntity {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  lines: PurchaseOrderLine[];
  totalCost: number;
  currency: string;
  status: 'draft' | 'issued' | 'partially_received' | 'received' | 'cancelled';
  expectedDeliveryDate?: string;
  goodsReceiptReferences?: string[];
  createdByUid: string;
}

// --- 5.9 System Settings & Integration ---
export interface SystemSettingItem {
  id: string;
  category: 'general' | 'storefront' | 'security' | 'integrations' | 'notifications';
  key: string;
  value: any;
  updatedBy: string;
  updatedAt: string;
}
