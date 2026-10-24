/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryNode } from '../types';

export const CATEGORIES: CategoryNode[] = [
  {
    id: 'circuit-protection',
    name: 'Circuit Protection',
    slug: 'circuit-protection',
    subcategories: [
      { id: 'mcb', name: 'Miniature Circuit Breakers (MCB)', slug: 'mcb' },
      { id: 'mccb', name: 'Molded Case Circuit Breakers (MCCB)', slug: 'mccb' },
      { id: 'rcd', name: 'Residual Current Devices (RCD/RCCB)', slug: 'rcd' },
      { id: 'rcbo', name: 'Residual Current Breaker with Overcurrent (RCBO)', slug: 'rcbo' },
      { id: 'isolators', name: 'Isolators & Disconnectors', slug: 'isolators' },
      { id: 'spd', name: 'Surge Protection Devices (SPD)', slug: 'spd' },
      { id: 'fuses', name: 'Fuses & Fuse Holders', slug: 'fuses' },
    ]
  },
  {
    id: 'switches-sockets',
    name: 'Switches and Sockets',
    slug: 'switches-sockets',
    subcategories: [
      { id: 'domestic-switches', name: 'Domestic Switches', slug: 'domestic-switches' },
      { id: 'industrial-switches', name: 'Industrial Switches', slug: 'industrial-switches' },
      { id: 'power-sockets', name: 'Power Sockets', slug: 'power-sockets' },
      { id: 'weatherproof-sockets', name: 'Weatherproof Accessories', slug: 'weatherproof-sockets' },
    ]
  },
  {
    id: 'cables-wires',
    name: 'Cables and Wires',
    slug: 'cables-wires',
    subcategories: [
      { id: 'power-cables', name: 'Power Cables', slug: 'power-cables' },
      { id: 'armoured-cables', name: 'Armoured Cables (SWA)', slug: 'armoured-cables' },
      { id: 'control-cables', name: 'Control & Instrumentation', slug: 'control-cables' },
      { id: 'fire-resistant-cables', name: 'Fire Resistant Cables', slug: 'fire-resistant-cables' },
      { id: 'data-cables', name: 'Data & Networking', slug: 'data-cables' },
    ]
  },
  {
    id: 'conduits-management',
    name: 'Conduits and Cable Management',
    slug: 'conduits-management',
    subcategories: [
      { id: 'pvc-conduits', name: 'PVC Conduits', slug: 'pvc-conduits' },
      { id: 'galvanised-conduits', name: 'Galvanised Steel Conduits', slug: 'galvanised-conduits' },
      { id: 'cable-trays', name: 'Cable Trays', slug: 'cable-trays' },
      { id: 'trunking', name: 'Trunking Systems', slug: 'trunking' },
    ]
  },
  {
    id: 'industrial-automation',
    name: 'Industrial Automation',
    slug: 'industrial-automation',
    subcategories: [
      { id: 'plcs', name: 'Programmable Logic Controllers (PLC)', slug: 'plcs' },
      { id: 'hmis', name: 'Human Machine Interfaces (HMI)', slug: 'hmis' },
      { id: 'vfd', name: 'Variable Frequency Drives (VFD)', slug: 'vfd' },
      { id: 'contactors', name: 'Contactors & Overloads', slug: 'contactors' },
      { id: 'sensors', name: 'Industrial Sensors', slug: 'sensors' },
    ]
  },
  {
    id: 'panels-distribution',
    name: 'Electrical Panels and Distribution',
    slug: 'panels-distribution',
    subcategories: [
      { id: 'distribution-boards', name: 'Distribution Boards', slug: 'distribution-boards' },
      { id: 'panel-enclosures', name: 'Panel Enclosures', slug: 'panel-enclosures' },
      { id: 'busbars', name: 'Busbar Systems', slug: 'busbars' },
    ]
  },
  {
    id: 'lighting',
    name: 'Lighting',
    slug: 'lighting',
    subcategories: [
      { id: 'industrial-led', name: 'Industrial LED Lighting', slug: 'industrial-led' },
      { id: 'emergency-lighting', name: 'Emergency Lighting', slug: 'emergency-lighting' },
      { id: 'outdoor-lighting', name: 'Outdoor & Street Lighting', slug: 'outdoor-lighting' },
    ]
  },
  {
    id: 'earthing-lightning',
    name: 'Earthing and Lightning Protection',
    slug: 'earthing-lightning',
    subcategories: [
      { id: 'earth-rods', name: 'Earth Rods & Accessories', slug: 'earth-rods' },
      { id: 'lightning-conductors', name: 'Lightning Conductors', slug: 'lightning-conductors' },
    ]
  },
  {
    id: 'safety-fire',
    name: 'Fire Alarm and Safety',
    slug: 'safety-fire',
    subcategories: [
      { id: 'fire-detectors', name: 'Fire Detectors', slug: 'fire-detectors' },
      { id: 'alarm-panels', name: 'Alarm Control Panels', slug: 'alarm-panels' },
    ]
  },
  {
    id: 'security',
    name: 'CCTV and Security',
    slug: 'security',
    subcategories: [
      { id: 'ip-cameras', name: 'IP Cameras', slug: 'ip-cameras' },
      { id: 'dvrs', name: 'DVRs & NVRs', slug: 'dvrs' },
    ]
  },
  {
    id: 'renewables',
    name: 'Solar and Renewable Energy',
    slug: 'renewables',
    subcategories: [
      { id: 'solar-panels', name: 'Solar PV Panels', slug: 'solar-panels' },
      { id: 'solar-inverters', name: 'Solar Inverters', slug: 'solar-inverters' },
    ]
  },
  {
    id: 'test-instruments',
    name: 'Electrical Test Instruments',
    slug: 'test-instruments',
    subcategories: [
      { id: 'multimeters', name: 'Multimeters', slug: 'multimeters' },
      { id: 'clamp-meters', name: 'Clamp Meters', slug: 'clamp-meters' },
      { id: 'insulation-testers', name: 'Insulation Testers', slug: 'insulation-testers' },
    ]
  },
  {
    id: 'industrial-tools',
    name: 'Industrial Tools',
    slug: 'industrial-tools',
    subcategories: [
      { id: 'hand-tools', name: 'Hand Tools', slug: 'hand-tools' },
      { id: 'power-tools', name: 'Power Tools', slug: 'power-tools' },
    ]
  },
  {
    id: 'transformers',
    name: 'Transformers and Power Accessories',
    slug: 'transformers',
  },
  {
    id: 'ups-protection',
    name: 'UPS and Power Protection',
    slug: 'ups-protection',
  },
  {
    id: 'e-mobility',
    name: 'E-Mobility',
    slug: 'e-mobility',
    subcategories: [
      { id: 'ev-chargers', name: 'EV Chargers', slug: 'ev-chargers' },
      { id: 'ev-cables', name: 'EV Charging Cables', slug: 'ev-cables' },
    ]
  },
  {
    id: 'clearance',
    name: 'Clearance and Special Offers',
    slug: 'clearance',
  }
];
