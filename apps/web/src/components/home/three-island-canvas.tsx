"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeIslandCanvasProps {
  onFpsSample?: (fps: number) => void;
}

export default function ThreeIslandCanvas({ onFpsSample }: ThreeIslandCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1dc, 2.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const tealGlow = new THREE.PointLight(0x0f766e, 3, 10);
    tealGlow.position.set(0, -1, 0);
    scene.add(tealGlow);

    // 3. Floating Island Objects Hierarchy
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Top Grass Plate
    const grassGeo = new THREE.CylinderGeometry(2.8, 3.0, 0.6, 32);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep Emerald
      roughness: 0.6,
      metalness: 0.1,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = 0.3;
    grass.receiveShadow = true;
    islandGroup.add(grass);

    // Sub-surface Soil / Terracotta Rock Base
    const earthGeo = new THREE.ConeGeometry(3.0, 3.2, 12);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Rich Terracotta
      roughness: 0.8,
      flatShading: true,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.x = Math.PI;
    earth.position.y = -1.3;
    earth.castShadow = true;
    islandGroup.add(earth);

    // Stylized Crystal Lake / Soft Gold Spring
    const waterGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0.6, 0.63, 0.4);
    islandGroup.add(water);

    // Tiny Stylized Trees (Green Domes)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

    const treePositions = [
      { x: -1.2, z: -0.8, scale: 0.9 },
      { x: -1.6, z: 0.2, scale: 0.7 },
      { x: 1.4, z: -1.1, scale: 0.8 },
      { x: -0.4, z: -1.4, scale: 1.1 },
    ];

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8), treeTrunkMat);
      trunk.position.y = 0.25;
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45), treeFoliageMat);
      foliage.position.y = 0.65;
      tree.add(trunk);
      tree.add(foliage);
      tree.position.set(pos.x, 0.6, pos.z);
      tree.scale.set(pos.scale, pos.scale, pos.scale);
      islandGroup.add(tree);
    });

    // Ambient Floating Golden Spores / Glow Particles
    const particleCount = 24;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 6;
      particlePos[i + 1] = Math.random() * 3;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Smooth Mouse Interaction Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.45;
      targetRotX = -ny * 0.25;
    };
    window.addEventListener("mousemove", onMouseMove);

    // 5. Animation Loop with FPS sampling
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating levitation on Y-axis
      islandGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

      // Continuous gentle rotation + mouse tilt lerp
      islandGroup.rotation.y += (targetRotY - islandGroup.rotation.y + elapsedTime * 0.15) * 0.05;
      islandGroup.rotation.x += (targetRotX - islandGroup.rotation.x) * 0.05;

      // Particle floating drift
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        if (onFpsSample) onFpsSample(fps);
        frameCount = 0;
        lastTime = now;
      }
    };
    animate();

    // 6. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW && newH) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      grassGeo.dispose();
      grassMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      treeTrunkMat.dispose();
      treeFoliageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onFpsSample]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] lg:min-h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      dir="ltr"
    />
  );
}
