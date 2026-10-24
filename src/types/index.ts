/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  image?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  subcategories?: CategoryNode[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
}

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

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  taxId?: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Enquiry {
  id: string;
  customerId?: string;
  type: 'project' | 'cable' | 'bulk-quote' | 'general';
  status: 'pending' | 'reviewed' | 'responded' | 'closed';
  subject: string;
  message: string;
  data: Record<string, any>;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'admin';
  company?: string;
  phone?: string;
  jobTitle?: string;
  taxId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
}

