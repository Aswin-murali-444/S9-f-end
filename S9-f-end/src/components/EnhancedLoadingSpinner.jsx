import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import { gsap } from 'gsap';
import './EnhancedLoadingSpinner.css';

const LoadingCube = ({ position, rotationSpeed = 1, color = '#4f9cf9' }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * rotationSpeed;
      meshRef.current.rotation.y += 0.01 * rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial 
        color={color}
        transparent
        opacity={0.8}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

const LoadingText = ({ text = "Loading..." }) => {
  const textRef = useRef();

  useEffect(() => {
    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 0.5,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      });
    }
  }, []);

  return (
    <Center position={[0, -2, 0]}>
      <Text3D
        ref={textRef}
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.05}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshStandardMaterial 
          color="#4f9cf9"
          transparent
          opacity={0.8}
        />
      </Text3D>
    </Center>
  );
};

const EnhancedLoadingSpinner = ({ 
  text = "Loading...", 
  size = "medium",
  show3D = true,
  className = ""
}) => {
  const containerRef = useRef();
  const spinnerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      // Fade in animation
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  if (show3D) {
    return (
      <div ref={containerRef} className={`enhanced-loading-spinner ${sizeClasses[size]} ${className}`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <LoadingCube position={[-1, 0, 0]} rotationSpeed={1} color="#4f9cf9" />
          <LoadingCube position={[0, 0, 0]} rotationSpeed={1.5} color="#6366f1" />
          <LoadingCube position={[1, 0, 0]} rotationSpeed={2} color="#8b5cf6" />
          
          <LoadingText text={text} />
        </Canvas>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`enhanced-loading-spinner-2d ${sizeClasses[size]} ${className}`}>
      <div ref={spinnerRef} className="spinner-container">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-text">{text}</div>
      </div>
    </div>
  );
};

export default EnhancedLoadingSpinner;
