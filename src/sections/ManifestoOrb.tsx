import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface ManifestoOrbProps {
  scrollProgress: number;
}

export default function ManifestoOrb({ scrollProgress }: ManifestoOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || cleanupRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Custom shaders
    const orbVertexShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying float vDistortion;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vDistortion = sin(position.x * 4.0 + uTime) * cos(position.y * 4.0 + uTime) * 0.15;
        vec3 transformed = position + normal * vDistortion;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const orbFragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec3 vNormal;
      varying float vDistortion;

      void main() {
        float viewDot = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
        vec3 color1 = vec3(0.65, 0.55, 0.98);
        vec3 color2 = vec3(0.98, 0.66, 0.83);
        vec3 color3 = vec3(1.0, 1.0, 1.0);
        vec3 baseGradient = mix(color1, color2, vNormal.y * 0.5 + 0.5);
        baseGradient = mix(baseGradient, color3, viewDot);
        float shimmer = sin(vNormal.x * 10.0 + uTime * 2.0) * 0.5 + 0.5;
        vec3 finalColor = mix(baseGradient, color3, shimmer * 0.3);
        float alpha = 0.9 + vDistortion * 2.0;
        alpha += pow(viewDot, 3.0) * uMouse.x;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const textVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const textFragmentShader = `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        uv.y = uv.y * 0.8 + 0.1;
        vec4 tex = texture2D(uTexture, uv);
        float lines = sin(vUv.y * 600.0 + uTime * 10.0) * 0.05;
        tex.rgb += lines;
        tex.a *= uOpacity;
        gl_FragColor = tex;
      }
    `;

    // Geometry & Mesh Assembly
    const geometry = new THREE.IcosahedronGeometry(2.5, 30);

    // Primary orb
    const orbMaterial = new THREE.ShaderMaterial({
      vertexShader: orbVertexShader,
      fragmentShader: orbFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScrollSpeed: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      transparent: true,
    });
    const orb = new THREE.Mesh(geometry, orbMaterial);

    // Wireframe 1
    const wireframe1Material = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe1 = new THREE.Mesh(geometry, wireframe1Material);

    // Wireframe 2
    const wireframe2Material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const wireframe2 = new THREE.Mesh(geometry, wireframe2Material);

    // Group
    const group = new THREE.Group();
    group.position.z = -1;
    group.add(orb);
    group.add(wireframe1);
    group.add(wireframe2);
    scene.add(group);

    // DOM to Texture Conversion
    const targetText = "TRACTION\nAUTHORITY\nFUNDING";
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 2048;
    textCanvas.height = 1024;
    const textCtx = textCanvas.getContext('2d')!;
    textCtx.font = 'bold 150px Inter, sans-serif';
    textCtx.fillStyle = '#ffffff';
    textCtx.textAlign = 'center';
    const lines = targetText.split('\n');
    lines.forEach((line, index) => {
      textCtx.fillText(line, 1024, 400 + index * 180);
    });

    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.ShaderMaterial({
      vertexShader: textVertexShader,
      fragmentShader: textFragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const textGeometry = new THREE.PlaneGeometry(10, 5);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = -0.5;
    group.add(textMesh);
    textMesh.visible = false;

    // Mouse tracking
    const targetMouse = { x: 0.5, y: 0.5 };
    const onMouseMove = (event: MouseEvent) => {
      targetMouse.x = event.clientX / window.innerWidth;
      targetMouse.y = 1.0 - event.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    const positionAttribute = geometry.attributes.position;
    const originalPositions = positionAttribute.array.slice();

    const animate = () => {
      if (!container.isConnected) return;
      requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Lerp uTime
      orbMaterial.uniforms.uTime.value += (time - orbMaterial.uniforms.uTime.value) * 0.1;
      textMaterial.uniforms.uTime.value = time;

      // Zoom camera
      camera.position.z = THREE.MathUtils.lerp(4, 1.5, scrollProgress);

      // Lerp mouse uniform
      orbMaterial.uniforms.uMouse.value.x += (targetMouse.x - orbMaterial.uniforms.uMouse.value.x) * 0.05;

      // Rotate group
      group.rotation.y = time * 0.1 + scrollProgress * Math.PI * 2;
      group.rotation.x = time * 0.05;

      // Wave distortion on vertices
      for (let i = 0; i < positionAttribute.count; i++) {
        const px = originalPositions[i * 3];
        const py = originalPositions[i * 3 + 1];
        const pz = originalPositions[i * 3 + 2];
        const wave = Math.sin(px * 2 + time) * Math.cos(py * 2 + time) * (0.2 + scrollProgress * 0.8);
        positionAttribute.setXYZ(i, px, py, pz + wave);
      }
      positionAttribute.needsUpdate = true;

      // Inner text phase
      if (scrollProgress > 0.85) {
        textMesh.visible = true;
        textMaterial.uniforms.uOpacity.value += (1 - textMaterial.uniforms.uOpacity.value) * 0.05;
        textMaterial.uniforms.uSpeed.value += (1 - textMaterial.uniforms.uSpeed.value) * 0.05;
        textMesh.rotation.y += (Math.PI * 4 - textMesh.rotation.y) * 0.05;
        textMesh.position.x += (-8 - textMesh.position.x) * 0.05;
      } else {
        textMesh.visible = false;
        textMaterial.uniforms.uOpacity.value = 0;
      }

      composer.render();
    };

    animate();

    // Resize handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
      orbMaterial.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    cleanupRef.current = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      orbMaterial.dispose();
      wireframe1Material.dispose();
      wireframe2Material.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      textGeometry.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Update scroll-driven camera zoom via scrollProgress prop
  useEffect(() => {
    // This effect runs when scrollProgress changes
    // The animation loop handles the actual camera movement
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      id="orb-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}