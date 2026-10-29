/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';
import { CATEGORIES } from './categories';

const baseProducts: any[] = [
  // Circuit Protection
  {
    id: 'p1',
    name: 'Molded Case Circuit Breaker - T5 630A High Capacity',
    slug: 'mccb-t5-630a-high-capacity',
    description: 'High-performance MCCB for power distribution systems. Features advanced thermal-magnetic protection and a compact footprint.',
    price: 849.00,
    currency: 'USD',
    sku: 'MCCB-T5-630',
    categoryId: 'mccb',
    brandId: 'elecsynchron',
    images: ['/assets/images/industrial_circuit_breaker_1792848534487.jpg'],
    specifications: { 'Rated Current': '630A', 'Breaking Capacity': '50kA', 'Poles': '3P' },
    stock: 12,
    isAvailable: true,
    status: 'active',
    tags: ['featured', 'circuit-protection', 'mccb'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'p2',
    name: 'Miniature Circuit Breaker 16A 3-Pole Type C',
    slug: 'mcb-16a-3p-type-c',
    description: 'Standard MCB for commercial and industrial applications. Provides reliable overcurrent protection.',
    price: 45.00,
    currency: 'USD',
    sku: 'MCB-16-3C',
    categoryId: 'mcb',
    brandId: 'generic',
    images: ['/assets/images/industrial_circuit_breaker_1792848534487.jpg'],
    specifications: { 'Current': '16A', 'Tripping Curve': 'Type C', 'Poles': '3P' },
    stock: 150,
    isAvailable: true,
    status: 'active',
    tags: ['mcb', 'circuit-protection'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'p3',
    name: 'Simatic S7-1500 Advanced Industrial PLC Controller',
    slug: 'simatic-s7-1500-advanced-plc',
    description: 'The standard for industrial automation. Powerful, scalable, and highly integrated.',
    price: 1590.00,
    currency: 'USD',
    sku: 'PLC-S7-1500',
    categoryId: 'plcs',
    brandId: 'elecsynchron',
    images: ['/assets/images/prod_industrial_plc_1792851607627.jpg'],
    specifications: { 'Processing Time': '10ns', 'IO Capacity': 'Up to 32 modules', 'Communication': 'Profinet' },
    stock: 5,
    isAvailable: true,
    status: 'active',
    tags: ['featured', 'automation', 'plcs'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'p4',
    name: 'Heavy Duty Industrial Power Cable Reel - 240mm² Core',
    slug: 'heavy-duty-cable-reel-240mm',
    description: 'Large wooden cable reel with premium copper core XLPE insulated power cable.',
    price: 2450.00,
    currency: 'USD',
    sku: 'CABLE-240-XLPE',
    categoryId: 'power-cables',
    brandId: 'pyrotech',
    images: ['/assets/images/industrial_cable_reel_1792848534820.jpg'],
    specifications: { 'Cross Section': '240mm²', 'Voltage Rating': '1kV', 'Insulation': 'XLPE' },
    stock: 8,
    isAvailable: true,
    status: 'active',
    tags: ['cables', 'heavy-duty', 'power-cables'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'p5',
    name: 'Rugged LED High-Bay Floodlight - 150W IP66',
    slug: 'rugged-led-high-bay-150w',
    description: 'Durable lighting for industrial halls and outdoor sites. Features high lumen output and advanced cooling.',
    price: 285.00,
    currency: 'USD',
    sku: 'LED-HB-150-R',
    categoryId: 'industrial-led',
    brandId: 'lumenpro',
    images: ['/assets/images/prod_led_floodlight_1792851607088.jpg'],
    specifications: { 'Power': '150W', 'Luminous Flux': '18,000 lm', 'IP Rating': 'IP66' },
    stock: 45,
    isAvailable: true,
    status: 'active',
    tags: ['featured', 'lighting', 'industrial-led'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  }
];

const REAL_INDUSTRIAL_IMAGES = [
  '/assets/images/industrial_circuit_breaker_1792848534487.jpg',
  '/assets/images/prod_industrial_plc_1792851607627.jpg',
  '/assets/images/industrial_cable_reel_1792848534820.jpg',
  '/assets/images/prod_led_floodlight_1792851607088.jpg',
  '/assets/images/cat_industrial_automation_1792851607023.jpg',
  '/assets/images/industrial_category_distribution_1792848535201.jpg',
  '/assets/images/app_manufacturing_systems_1792851607363.jpg',
  '/assets/images/app_commercial_construction_1792851606559.jpg',
];

// Generate dedicated products for EVERY category and subcategory node
const generatedCategoryProducts: any[] = [];
let counter = 100;

CATEGORIES.forEach(cat => {
  const catId = cat.id;
  const subcategories = cat.subcategories || [];

  if (subcategories.length > 0) {
    subcategories.forEach(sub => {
      // Generate 5 products for each subcategory
      for (let i = 1; i <= 5; i++) {
        counter++;
        generatedCategoryProducts.push({
          id: `prod-${sub.id}-${i}`,
          name: `${sub.name} - Professional Grade ${counter}`,
          slug: `${sub.slug}-pro-grade-${counter}`,
          description: `High-reliability industrial grade component engineered for ${sub.name}. Tested to rigorous IEC standards for heavy commercial and industrial environments.`,
          price: Math.floor(75 + ((counter * 31) % 1500)),
          currency: 'USD',
          sku: `SKU-${sub.id.toUpperCase()}-${counter}`,
          categoryId: sub.id,
          brandId: ['siemens', 'schneider', 'abb', 'eaton', 'omron', 'rockwell'][counter % 6],
          images: [
            REAL_INDUSTRIAL_IMAGES[counter % REAL_INDUSTRIAL_IMAGES.length],
            REAL_INDUSTRIAL_IMAGES[(counter + 1) % REAL_INDUSTRIAL_IMAGES.length]
          ],
          specifications: {
            'Series': `DIS-PRO-${counter}`,
            'Certification': 'IEC / CE / UL Listed',
            'Protection Class': 'IP65 / NEMA 4X',
            'Warranty': '3 Years Standard'
          },
          stock: 20 + (counter % 120),
          isAvailable: true,
          status: 'active',
          tags: [catId, sub.id, counter % 3 === 0 ? 'featured' : 'standard', 'industrial'],
          createdAt: '2026-10-01T00:00:00Z',
          updatedAt: '2026-10-01T00:00:00Z'
        });
      }
    });
  } else {
    // Parent only category (e.g. transformers, ups-protection, clearance)
    for (let i = 1; i <= 5; i++) {
      counter++;
      generatedCategoryProducts.push({
        id: `prod-${catId}-${i}`,
        name: `${cat.name} System Unit ${counter}`,
        slug: `${cat.slug}-unit-${counter}`,
        description: `Certified ${cat.name} equipment designed for continuous industrial operation and high fault tolerance.`,
        price: Math.floor(120 + ((counter * 43) % 2200)),
        currency: 'USD',
        sku: `SKU-${catId.toUpperCase()}-${counter}`,
        categoryId: catId,
        brandId: ['siemens', 'schneider', 'abb', 'eaton'][counter % 4],
        images: [
          REAL_INDUSTRIAL_IMAGES[counter % REAL_INDUSTRIAL_IMAGES.length],
          REAL_INDUSTRIAL_IMAGES[(counter + 1) % REAL_INDUSTRIAL_IMAGES.length]
        ],
        specifications: {
          'Model': `UNIT-${counter}`,
          'Compliance': 'IEC 60947',
          'Rating': 'Heavy Duty'
        },
        stock: 15 + (counter % 80),
        isAvailable: true,
        status: 'active',
        tags: [catId, 'featured', 'industrial'],
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z'
      });
    }
  }
});

export const PRODUCTS: Product[] = [...baseProducts, ...generatedCategoryProducts];
