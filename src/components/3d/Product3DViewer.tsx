import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d, Layers, Sparkles } from 'lucide-react';

interface Product3DViewerProps {
  productName: string;
  image?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ productName, image }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'3d' | 'photo'>('3d');

  useEffect(() => {
    if (activeMode !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090E, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0B0F17, 3);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00F0FF, 12, 20);
    cyanLight.position.set(5, 5, 5);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8A2BE2, 10, 20);
    violetLight.position.set(-5, -5, 5);
    scene.add(violetLight);

    // Product Assembly Group
    const productGroup = new THREE.Group();
    scene.add(productGroup);

    // Main Industrial Equipment Chassis (Beveled Rounded Box)
    const chassisGeo = new THREE.BoxGeometry(2.4, 3.2, 1.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0B0F17,
      roughness: 0.2,
      metalness: 0.9,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    productGroup.add(chassisMesh);

    // Wireframe Outer Frame
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireMesh = new THREE.Mesh(chassisGeo, wireMat);
    wireMesh.scale.set(1.03, 1.03, 1.03);
    productGroup.add(wireMesh);

    // Front Terminal Display Screen
    const screenGeo = new THREE.PlaneGeometry(1.8, 1.2);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.85,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.6, 0.71);
    productGroup.add(screenMesh);

    // Status Ring Indicator
    const ringGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 50);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8A2BE2 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, -0.6, 0.72);
    productGroup.add(ringMesh);

    // Orbiting Industrial Particles
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);

    // Interactive Drag / Touch Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      productGroup.rotation.y += deltaX * 0.01;
      productGroup.rotation.x += deltaY * 0.01;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;

      productGroup.rotation.y += deltaX * 0.015;
      productGroup.rotation.x += deltaY * 0.015;

      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Dynamic resize observer for responsive viewports
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      if (!isDragging) {
        productGroup.rotation.y += 0.4 * delta;
      }
      pSystem.rotation.y -= 0.1 * delta;
      ringMesh.rotation.z += 1.5 * delta;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      chassisGeo.dispose();
      chassisMat.dispose();
      wireMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [activeMode]);

  return (
    <div className="relative aspect-square bg-navy-dark/95 border border-border-glow rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-[0_0_30px_rgba(0,240,255,0.15)]">
      {/* Top Toggle Mode Bar */}
      <div className="flex items-center justify-between z-10 p-2 bg-navy/90 border border-border rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono text-teal font-bold px-2">
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span>Interactive Component Model</span>
        </div>
        <div className="flex items-center gap-1 bg-navy-dark p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveMode('3d')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeMode === '3d'
                ? 'bg-teal text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Rotate3d className="w-3 h-3" />
            <span>3D Mesh</span>
          </button>
          <button
            onClick={() => setActiveMode('photo')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeMode === 'photo'
                ? 'bg-teal text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>High-Res Photo</span>
          </button>
        </div>
      </div>

      {/* Center Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center my-2">
        {activeMode === '3d' ? (
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted uppercase tracking-widest bg-navy/80 px-3 py-1 rounded-full border border-border pointer-events-none">
              Click & Drag to Rotate 3D Model
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-6 flex items-center justify-center">
            <img 
              src={image || '/src/assets/images/placeholder.jpg'} 
              alt={productName}
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]" 
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted z-10 px-2 pt-2 border-t border-border">
        <span>CAD Model: DXF/STEP Available</span>
        <span className="text-teal font-bold">IEC 60947-2 Certified</span>
      </div>
    </div>
  );
};
