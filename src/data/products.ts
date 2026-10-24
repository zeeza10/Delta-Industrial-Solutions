/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

// Using 'any' for specifications temporarily to bypass strict Record<string, string> mismatch in concat
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
    tags: ['featured', 'circuit-protection'],
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
    tags: ['mcb'],
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
    tags: ['featured', 'automation'],
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
    tags: ['cables', 'heavy-duty'],
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
    tags: ['featured', 'lighting'],
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

const PRODUCT_PREFIXES = [
  'Compact Modular Circuit Breaker',
  'Variable Frequency Inverter Drive',
  'Profinet Ethernet Industrial PLC',
  'Heavy Duty SWA Armoured Cable Reel',
  'High-Lumen Industrial LED Bay Light',
  'Opto-Electronic Diffuse Sensor',
  'Motor Protection Contactor 40A',
  'IP67 Submersible Cable Conduit',
  'Smart Power Metering Gateway',
  'Modular Distribution Terminal Busbar'
];

const demoProducts: any[] = Array.from({ length: 120 }).map((_, i) => {
  const prefix = PRODUCT_PREFIXES[i % PRODUCT_PREFIXES.length];
  const modelCode = 1000 + i;
  const imageIndex = i % REAL_INDUSTRIAL_IMAGES.length;
  const secondaryImageIndex = (i + 1) % REAL_INDUSTRIAL_IMAGES.length;
  
  return {
    id: `demo-${modelCode}`,
    name: `${prefix} Series ${modelCode} - Heavy Duty`,
    slug: `${prefix.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-series-${modelCode}`,
    description: `Engineered for high-reliability commercial, substation, and factory installations. Certified to IEC 60947 and CE safety protocols with high thermal withstand.`,
    price: Math.floor(65 + ((i * 37) % 1850)),
    currency: 'USD',
    sku: `SKU-IND-${modelCode}`,
    categoryId: ['mcb', 'plcs', 'power-cables', 'industrial-led', 'sensors', 'mccb', 'distribution-boards'][i % 7],
    brandId: ['siemens', 'schneider', 'phoenix-contact', 'rockwell', 'sew-eurodrive', 'abb', 'eaton', 'omron'][i % 8],
    images: [
      REAL_INDUSTRIAL_IMAGES[imageIndex],
      REAL_INDUSTRIAL_IMAGES[secondaryImageIndex]
    ],
    specifications: {
      'Model Series': `DIS-${modelCode}`,
      'Standard': 'IEC 60947-2 / CE',
      'Operating Voltage': `${230 + ((i % 3) * 170)}V AC`,
      'Enclosure Rating': i % 2 === 0 ? 'IP65 Rugged' : 'IP20 Cabinet'
    },
    stock: 15 + ((i * 7) % 140),
    isAvailable: true,
    tags: ['industrial', 'stock', i % 5 === 0 ? 'featured' : 'standard'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z'
  };
});

export const PRODUCTS: Product[] = [...baseProducts, ...demoProducts];
