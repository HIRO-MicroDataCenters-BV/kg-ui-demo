import React, { useRef } from "react";
import { Canvas } from "react-three-fiber";
import { useSpring, animated } from "@react-spring/three";

const Column = ({ color, height, ...props }) => {
    const meshRef = useRef();
  
    const { scale } = useSpring({
      from: { scale: [1, 0, 1] },
      to: { scale: [1, 1, 1] },
      config: { mass: 1, tension: 120, friction: 14, precision: 0.01 },
    });
  
    return (
      <mesh position={[0, -height / 2, 0]}>
        <animated.mesh {...props} ref={meshRef} scale={scale}>
          <boxGeometry args={[0.1, height, 0.1]} />
          <meshStandardMaterial color={color} />
        </animated.mesh>
      </mesh>
    );
  };

const BarChart = () => {
  return (
    <mesh>
      <Column position={[-0.2, 0, 0]} color="red" height={0.2} />
      <Column position={[-0.1, 0, 0]} color="green" height={0.3} />
      <Column position={[0, 0, 0]} color="blue" height={0.5} />
      <Column position={[0.1, 0, 0]} color="yellow" height={0.4} />
      <Column position={[0.2, 0, 0]} color="purple" height={0.5} />
    </mesh>
  );
};

export default BarChart;
