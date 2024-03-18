import React from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function Background() {
  const texture = useLoader(THREE.TextureLoader, "/background.jpg");
  
  return (
    <mesh>
      <sphereGeometry attach="geometry" args={[500, 60, 40]} />
      <meshBasicMaterial
        attach="material"
        map={texture}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export default Background;
