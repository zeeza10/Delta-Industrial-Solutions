/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const adminValidation = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validate SKU format (alphanumeric, hyphens, underscores, 3-30 chars)
   */
  isValidSKU(sku: string): boolean {
    const re = /^[A-Za-z0-9\-_]{3,30}$/;
    return re.test(sku.trim());
  },

  /**
   * Validate positive number
   */
  isPositiveNumber(val: number): boolean {
    return typeof val === 'number' && !isNaN(val) && val >= 0;
  },

  /**
   * Validate product payload before Firestore write
   */
  validateProduct(product: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters long.';
    }

    if (product.name && product.name.length > 200) {
      errors.name = 'Product name must not exceed 200 characters.';
    }

    if (!product.sku || !this.isValidSKU(product.sku)) {
      errors.sku = 'Valid SKU is required (3-30 alphanumeric characters, hyphens, underscores).';
    }

    if (typeof product.price !== 'number' || product.price < 0) {
      errors.price = 'Price must be a non-negative number.';
    }

    if (!product.categoryId || typeof product.categoryId !== 'string') {
      errors.categoryId = 'Category selection is required.';
    }

    if (!product.brandId || typeof product.brandId !== 'string') {
      errors.brandId = 'Brand selection is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validate user role assignment
   */
  validateRoleAssignment(role: string): boolean {
    const validRoles: UserRole[] = ['owner', 'super_admin', 'admin', 'manager', 'staff', 'viewer', 'customer'];
    return validRoles.includes(role as UserRole);
  },

  /**
   * Validate Category payload
   */
  validateCategory(category: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!category.name || typeof category.name !== 'string' || category.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters long.';
    }

    if (!category.slug || typeof category.slug !== 'string' || !/^[a-z0-9\-]+$/.test(category.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validate Brand payload
   */
  validateBrand(brand: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!brand.name || typeof brand.name !== 'string' || brand.name.trim().length < 2) {
      errors.name = 'Brand name must be at least 2 characters long.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
