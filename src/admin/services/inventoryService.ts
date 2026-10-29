/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Inventory & Logistics Service
 * Atomic stock adjustments, movement history, and inventory aggregation.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  orderBy,
  writeBatch,
  increment,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Product, StockMovement, StockMovementType } from '../../types';
import { auditService } from './auditService';

export class InventoryService {
  private readonly DEFAULT_WAREHOUSE_ID = 'wh-main-dubai';

  /**
   * Adjust stock level for a product (Atomic Transactional Update)
   * Updates product document and creates a movement record.
   */
  public async adjustStock(params: {
    productId: string;
    sku: string;
    delta: number;
    type: StockMovementType;
    reason: string;
    actor: { uid: string; email: string; role: string };
    allowNegative?: boolean;
    warehouseId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Database service offline' };

    try {
      const firestore = db!;
      const result = await runTransaction(firestore, async (transaction) => {
        const productRef = doc(firestore, 'products', params.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error('Product not found');
        }

        const productData = productSnap.data() as Product;
        const currentStock = productData.stock || 0;
        const newStock = currentStock + params.delta;

        // 1. Safety Check: Prevent negative stock if tracking is enabled and not explicitly allowed
        if (productData.trackInventory && newStock < 0 && !params.allowNegative) {
          throw new Error(`Insufficient stock. Current: ${currentStock}, Requested change: ${params.delta}`);
        }

        const movementRef = doc(collection(firestore, 'stock_movements'));
        const now = new Date().toISOString();

        // 2. Update Product Stock
        transaction.update(productRef, {
          stock: newStock,
          updatedAt: now,
          updatedBy: params.actor.uid
        });

        // 3. Create Movement Log
        const movement: StockMovement = {
          id: movementRef.id,
          productId: params.productId,
          sku: params.sku,
          warehouseId: params.warehouseId || this.DEFAULT_WAREHOUSE_ID,
          quantityChange: params.delta,
          previousQuantity: currentStock,
          newQuantity: newStock,
          movementType: params.type,
          reason: params.reason,
          recordedByUid: params.actor.uid,
          recordedByRole: params.actor.role,
          timestamp: now
        };
        transaction.set(movementRef, movement);

        return { previousQuantity: currentStock, newQuantity: newStock };
      });

      // 4. Audit Logging
      await auditService.log({
        adminUid: params.actor.uid,
        adminName: params.actor.email,
        actorRole: params.actor.role as any,
        action: 'update',
        details: `Inventory ${params.delta > 0 ? 'Increase' : 'Decrease'}: ${Math.abs(params.delta)} units for SKU ${params.sku} (${params.type}: ${params.reason}). Stock: ${result.previousQuantity} -> ${result.newQuantity}`,
        targetResource: 'products',
        resourceId: params.productId
      });

      return { success: true };
    } catch (err: any) {
      console.error('[InventoryService] adjustStock error:', err);
      return { success: false, error: err.message || 'Failed to adjust stock' };
    }
  }

  /**
   * Fetch movement history for a specific product
   */
  public async getProductMovements(productId: string): Promise<StockMovement[]> {
    if (!db) return [];
    try {
      const firestore = db!;
      const q = query(
        collection(firestore, 'stock_movements'),
        where('productId', '==', productId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as StockMovement));
    } catch (err) {
      console.warn('[InventoryService] getProductMovements error:', err);
      return [];
    }
  }

  /**
   * Fetch recent movements across all products
   */
  public async getRecentMovements(max: number = 20): Promise<StockMovement[]> {
    if (!db) return [];
    try {
      const firestore = db!;
      const q = query(
        collection(firestore, 'stock_movements'),
        orderBy('timestamp', 'desc'),
        limit(max)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as StockMovement));
    } catch (err) {
      console.warn('[InventoryService] getRecentMovements error:', err);
      return [];
    }
  }

  /**
   * Fetch inventory alerts (Low stock products)
   */
  public async getLowStockAlerts(): Promise<Product[]> {
    if (!db) return [];
    try {
      const firestore = db!;
      // Query for products where trackInventory is true AND stock <= lowStockThreshold
      // Note: Firestore doesn't support inequality on two different fields easily.
      // We'll fetch all products that have trackInventory enabled and filter in-memory if list is small,
      // or use a pre-calculated "isLowStock" flag (recommended for future).
      const q = query(
        collection(firestore, 'products'),
        where('trackInventory', '==', true),
        limit(500)
      );
      const snap = await getDocs(q);
      const products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      
      return products.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 0));
    } catch (err) {
      console.warn('[InventoryService] getLowStockAlerts error:', err);
      return [];
    }
  }
}

export const inventoryService = new InventoryService();
