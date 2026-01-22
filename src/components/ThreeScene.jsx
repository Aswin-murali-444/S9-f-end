import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import ThreeBackground from './ThreeBackground';

const ThreeScene = ({ 
  children, 
  background = 'particles', 
  cameraPosition = [0, 0, 5],
  enableControls = false,
  enableEnvironment = true,
  className = ''
}) => {
  const renderBackground = () => {
    switch (background) {
      case 'particles':
        return <ThreeBackground count={800} size={0.015} />;
      case 'stars':
        return <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />;
      case 'none':
        return null;
      default:
        return <ThreeBackground count={800} size={0.015} />;
    }
  };

  return (
    <div className={`three-scene ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 75 }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          {enableEnvironment && (
            <Environment preset="city" />
          )}
          
          {renderBackground()}
          
          {children}
          
          {enableControls && (
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
              autoRotate
              autoRotateSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeScene;
