'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

function LogoModel({ hovered }: { hovered: boolean }) {
  const { scene } = useGLTF('/logo-ducklab.glb')
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    // Forçar materiais a serem mais brilhantes se necessário
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const m = mesh.material as THREE.MeshStandardMaterial
          m.envMapIntensity = 2
          m.needsUpdate = true
        }
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (ref.current) {
      if (hovered) {
        // Gira rapidamente de forma contínua e dá um pequeno zoom
        ref.current.rotation.y += delta * 5 
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, 1.45, 0.15))
      } else {
        // Encontra a rotação frontal mais próxima (múltiplo de 2*PI) para não girar ao contrário
        const currentRotation = ref.current.rotation.y
        const targetRotation = Math.round(currentRotation / (Math.PI * 2)) * (Math.PI * 2)
        
        ref.current.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.15)
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, 1.3, 0.15))
      }
    }
  })

  return (
    <group ref={ref} scale={1.3} position={[0, -0.1, 0]}> {/* Escala reduzida e centralizada */}
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/logo-ducklab.glb')

export default function Navbar3DLogo() {
  const [hovered, setHovered] = useState(false)

  return (
    <div 
      className="absolute inset-0 h-full w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        className="pointer-events-none"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={1} color="#00EB69" />
        <Suspense fallback={null}>
          <LogoModel hovered={hovered} />
        </Suspense>
      </Canvas>
    </div>
  )
}
