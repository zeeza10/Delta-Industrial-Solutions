/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PageContainer, SectionHeading, PrimaryButton, SecondaryButton, TextLink } from '../components/ui/Base';
import { TextInput, SearchInput, SelectInput, Checkbox, QuantitySelector } from '../components/ui/Forms';
import { Badge, StatusIndicator, PriceDisplay, Breadcrumbs } from '../components/ui/Display';
import { ProductCard, CategoryCard, BrandTile, SpecificationTable } from '../components/ui/Cards';
import { Skeleton, ProductCardSkeleton, Modal, Feedback } from '../components/ui/Feedback';
import { Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export const StyleShowcase: React.FC = () => {
  const [qty, setQty] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Components', path: '/style-showcase' },
    { label: 'Design System', path: '#' },
  ];

  const sampleSpecs = {
    'Rated Voltage': '690V AC',
    'Amperage': '630A',
    'Breaking Capacity': '50kA',
    'Frequency': '50/60 Hz',
    'Protection': 'Thermal-Magnetic',
  };

  return (
    <PageContainer>
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />
      
      <SectionHeading 
        title="Design System Showcase" 
        subtitle="Core components and visual tokens for Delta Industrial Solutions."
      />

      {/* --- Buttons & Links --- */}
      <section className="mb-16">
        <h3 className="text-lg font-bold mb-6 border-b pb-2">Buttons & Actions</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <PrimaryButton>Primary Action</PrimaryButton>
          <PrimaryButton isLoading>Loading</PrimaryButton>
          <SecondaryButton>Secondary Action</SecondaryButton>
          <SecondaryButton leftIcon={<Trash2 className="w-4 h-4" />}>Delete</SecondaryButton>
          <QuantitySelector value={qty} onChange={setQty} />
          <TextLink href="#">Text Link Example</TextLink>
        </div>
      </section>

      {/* --- Forms --- */}
      <section className="mb-16">
        <h3 className="text-lg font-bold mb-6 border-b pb-2">Form Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TextInput label="Full Name" placeholder="John Doe" />
          <TextInput label="Email Address" type="email" placeholder="john@example.com" error="Please enter a valid email." />
          <SelectInput 
            label="Category" 
            options={[
              { label: 'Switchgear', value: 'sw' },
              { label: 'Cables', value: 'ca' },
              { label: 'Automation', value: 'au' },
            ]} 
          />
          <div className="flex flex-col gap-4">
            <Checkbox label="Remember me" defaultChecked />
            <Checkbox label="Subscribe to newsletter" />
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-semibold mb-2 block">Search Input</label>
            <SearchInput placeholder="Search catalog..." />
          </div>
        </div>
      </section>

      {/* --- Data Display --- */}
      <section className="mb-16">
        <h3 className="text-lg font-bold mb-6 border-b pb-2">Data & Status</h3>
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex gap-2">
            <Badge variant="primary">New</Badge>
            <Badge variant="success">In Stock</Badge>
            <Badge variant="error">Sold Out</Badge>
            <Badge variant="warning">Low Stock</Badge>
          </div>
          <div className="flex gap-4">
            <StatusIndicator status="online" label="System Online" />
            <StatusIndicator status="pending" label="Awaiting Quote" />
            <StatusIndicator status="offline" label="Offline" />
          </div>
          <PriceDisplay amount={1250.50} size="xl" />
        </div>
      </section>

      {/* --- Cards & Visuals --- */}
      <section className="mb-16">
        <h3 className="text-lg font-bold mb-6 border-b pb-2">Catalog Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <ProductCard 
            product={{
              id: "1",
              name: "Molded Case Circuit Breaker - T5 630A High Capacity",
              slug: "mccb-t5-630a",
              description: "High capacity industrial circuit breaker",
              categoryId: "switchgear",
              brandId: "abb",
              price: 849.00,
              currency: "USD",
              sku: "MCCB-T5-630A",
              images: ["/src/assets/images/industrial_circuit_breaker_1792848534487.jpg"],
              specifications: {},
              stock: 12,
              isAvailable: true,
              tags: ["new"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            isNew
          />
          <ProductCard 
            product={{
              id: "2",
              name: "Heavy Duty Industrial Power Cable Reel - 240mm² Core",
              slug: "cable-reel-240mm",
              description: "Armored copper power cable drum",
              categoryId: "cables",
              brandId: "prysmian",
              price: 2450.00,
              currency: "USD",
              sku: "CBL-240MM-DRUM",
              images: ["/src/assets/images/industrial_cable_reel_1792848534820.jpg"],
              specifications: {},
              stock: 5,
              isAvailable: true,
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
          />
          <ProductCardSkeleton />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <CategoryCard 
            name="Power Distribution & Switchgear" 
            count={142} 
            image="/src/assets/images/industrial_category_distribution_1792848535201.jpg"
          />
          <div className="grid grid-cols-2 gap-4">
            <BrandTile name="ElecSynchron" logo="/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg" />
            <BrandTile name="Generic Brand" logo="/src/assets/images/industrial_brand_logo_placeholder_1792848534850.jpg" />
          </div>
        </div>

        <div className="max-w-2xl">
          <h4 className="text-sm font-bold mb-4 uppercase text-text-secondary tracking-widest">Technical Specifications</h4>
          <SpecificationTable specs={sampleSpecs} />
        </div>
      </section>

      {/* --- Feedback & Overlays --- */}
      <section className="mb-16">
        <h3 className="text-lg font-bold mb-6 border-b pb-2">Feedback & Overlays</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Feedback 
            type="success" 
            title="Item added to cart" 
            message="Your quote has been updated successfully." 
          />
          <Feedback 
            type="error" 
            title="Connection error" 
            message="Unable to reach the procurement server. Please try again later." 
          />
          <Feedback 
            type="info" 
            title="Shipping Notice" 
            message="Orders over $500 qualify for free express delivery." 
          />
          <Feedback 
            type="loading" 
            title="Generating Quote..." 
          />
        </div>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>Open Sample Modal</PrimaryButton>
        
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Confirm Quote Request"
          footer={
            <>
              <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={() => setIsModalOpen(false)}>Confirm Request</PrimaryButton>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              You are about to request a formal quotation for <strong>14 items</strong> in your list. 
              Our procurement team will respond within 24 business hours.
            </p>
            <Feedback 
              type="info" 
              title="Tip" 
              message="Ensure your company tax ID is updated in your profile for faster processing." 
            />
          </div>
        </Modal>
      </section>
    </PageContainer>
  );
};
