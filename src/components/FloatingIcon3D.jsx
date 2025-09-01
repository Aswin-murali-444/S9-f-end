import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

const FloatingIcon3D = ({ 
  icon, 
  position = [0, 0, 0], 
  scale = 1, 
  color = '#4f9cf9',
  hoverColor = '#6366f1',
  rotationSpeed = 1,
  floatAmplitude = 0.5,
  floatSpeed = 1
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
      
      // Rotation animation
      meshRef.current.rotation.y += 0.01 * rotationSpeed;
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(scale * 1.2);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {icon}
          <meshStandardMaterial 
            color={hovered ? hoverColor : color}
            emissive={hovered ? color : '#000000'}
            emissiveIntensity={hovered ? 0.2 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
};

export default FloatingIcon3D;
