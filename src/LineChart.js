import React, { useRef } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { useSpring, animated, a } from "@react-spring/three";

const LineChart = () => {
  const points = [
    new Vector3(-0.2, 0, 0),
    new Vector3(-0.1, 0.1, 0),
    new Vector3(0, 0, 0),
    new Vector3(0.1, -0.1, 0),
    new Vector3(0.2, 0, 0),
  ];

  return (
    <>
      <Line points={points} color={0xffffff} />
      {points.map((point, index) => (
        <Point key={index} position={point} />
      ))}
    </>
  );
};

const Point = ({ color, height, ...props }) => {
  const meshRef = useRef();

  const { scale } = useSpring({
    from: { position: [1, 0, 1] },
    to: { position: [1, height, 1] },
    config: { mass: 1, tension: 120, friction: 14, precision: 0.01 },
  });

  return (
    <animated.mesh {...props} ref={meshRef} scale={scale}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color={0xff0000} />
    </animated.mesh>
  );
};

export default LineChart;
