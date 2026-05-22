'use client'

import { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Float, Center } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import DucklabMascot from './DucklabMascot'

// ─── 3D Mascot Model ────────────────────────────────────────────────────────
function MascotModel() {
  const bodyGroupRef = useRef<THREE.Group>(null)
  const { scene: originalScene } = useGLTF('/models/duck-masco.glb')

  // Clona o scene SEMPRE para não compartilhar o cache com outras instâncias
  // e não acumular modificações de material entre hot-reloads.
  const scene = useMemo(() => {
    return SkeletonUtils.clone(originalScene) as THREE.Group
  }, [originalScene])

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          
          materials.forEach((mat) => {
            const m = mat as THREE.MeshStandardMaterial
            // Apenas lista os nomes dos novos materiais no console para identificação
            console.log("Novo Mascote - Mesh:", mesh.name, "| Material:", m.name)
          })
        }
      }
    })
  }, [scene])

  // Limites de rotação em radianos — movimento sutil premium
  const MAX_H = THREE.MathUtils.degToRad(10)
  const MAX_V = THREE.MathUtils.degToRad(6)

  useFrame((state) => {
    const targetY = state.mouse.x * MAX_H
    const targetX = -state.mouse.y * MAX_V

    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = THREE.MathUtils.lerp(bodyGroupRef.current.rotation.y, targetY, 0.08)
      bodyGroupRef.current.rotation.x = THREE.MathUtils.lerp(bodyGroupRef.current.rotation.x, targetX, 0.08)
    }
  })

  return (
    <group ref={bodyGroupRef} scale={3.2} position={[0, -0.4, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/models/duck-masco.glb')

// ─── Loading Spinner ────────────────────────────────────────────────────────
function CanvasLoader() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 2
  })
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#00EB69" wireframe transparent opacity={0.5} />
    </mesh>
  )
}

// ─── Scene ──────────────────────────────────────────────────────────────────
export default function DucklabMascot3DScene() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)

  useEffect(() => {
    const detectWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (!gl) return false
        
        const version = gl.getParameter(gl.VERSION)
        return !!version
      } catch (e) {
        return false
      }
    }
    setWebglSupported(detectWebGL())
  }, [])

  if (webglSupported === null) {
    return <div className="absolute inset-0 w-full h-full bg-transparent" />
  }

  if (!webglSupported) {
    return <DucklabMascot />
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
        alpha: true,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        touchAction: 'auto',
      }}
    >
      <ambientLight intensity={0.3} color="#002a10" />
      <directionalLight position={[0, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, 3, 2]} intensity={0.6} color="#c8ffd4" />

      {/* Neon verde frontal — principal responsável pelo brilho */}
      <pointLight position={[0, 1, 5]}  intensity={12} color="#00EB69" distance={14} />
      <pointLight position={[-2, 2, 3]} intensity={8}  color="#00EB69" distance={12} />
      <pointLight position={[2, 0, 3]}  intensity={6}  color="#00c354" distance={10} />
      <pointLight position={[0, 4, -2]} intensity={5}  color="#00EB69" distance={12} />

      <Environment preset="warehouse" />

      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.8} floatingRange={[-0.15, 0.15]}>
        <Suspense fallback={<CanvasLoader />}>
          <MascotModel />
        </Suspense>
      </Float>
    </Canvas>
  )
}
