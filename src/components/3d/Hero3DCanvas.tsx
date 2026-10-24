import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090E, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Lights - Neon Cyan & Violet Point Lights
    const ambientLight = new THREE.AmbientLight(0x0B0F17, 2);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00F0FF, 15, 50);
    cyanLight.position.set(10, 10, 10);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8A2BE2, 18, 50);
    violetLight.position.set(-10, -10, 8);
    scene.add(violetLight);

    const magentaLight = new THREE.PointLight(0xFF007F, 8, 40);
    magentaLight.position.set(0, 12, -5);
    scene.add(magentaLight);

    // 3. Cyber 3D Group: Nested Core, Rings & Particles
    const industrialGroup = new THREE.Group();
    scene.add(industrialGroup);

    // Inner Core: Glassy Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2.8, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      wireframe: true,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    industrialGroup.add(coreMesh);

    // Middle Ring: Torus Knot
    const ringGeo = new THREE.TorusGeometry(5.2, 0.08, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8A2BE2,
      wireframe: true,
      emissive: 0x8A2BE2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    industrialGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      wireframe: true,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.5,
    }));
    ringMesh2.rotation.y = Math.PI / 4;
    industrialGroup.add(ringMesh2);

    // Outer Node Spheres Array
    const nodeCount = 12;
    const nodeGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xFF007F,
      emissive: 0xFF007F,
      emissiveIntensity: 1,
    });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 6.5;
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 2);
      industrialGroup.add(nodeMesh);
    }

    // Floating Cyber Particle Field
    const particleCount = isSoftwareGl ? 200 : 500;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00F0FF);
    const color2 = new THREE.Color(0x8A2BE2);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 4. Mouse Interactive Parallax
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 5. Render Loop with Smooth Damping
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotate 3D industrial group
      coreMesh.rotation.x += 0.3 * delta;
      coreMesh.rotation.y += 0.4 * delta;

      ringMesh1.rotation.z += 0.2 * delta;
      ringMesh2.rotation.x += 0.25 * delta;

      industrialGroup.rotation.y = elapsedTime * 0.15;
      particleSystem.rotation.y = -elapsedTime * 0.05;

      // Mouse Parallax Damping
      targetX += (mouseX * 2.5 - targetX) * 0.05;
      targetY += (-mouseY * 2.5 - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up WebGL resources
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[580px] overflow-hidden flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      
      {/* Ambient Neon Glow Overlay Filters */}
      <div className="absolute inset-0 bg-radial from-transparent via-navy/50 to-page-bg pointer-events-none z-1" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-neon/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-violet-neon/15 rounded-full blur-3xl pointer-events-none z-0" />
    </div>
  );
};
