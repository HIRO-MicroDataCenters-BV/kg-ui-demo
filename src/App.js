import "./App.css";

import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  createRef,
} from "react";
import { Canvas, useFrame, extend } from "react-three-fiber";
import { Stats, OrbitControls, Plane } from "@react-three/drei";
import { QuadraticBezierLine, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, a } from "@react-spring/three";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { VRButton, ARButton, XR, Controllers, Hands } from "@react-three/xr";
import {
  Sparkles,
  Shadow,
  ContactShadows,
  Billboard,
  Environment,
  BakeShadows,
} from "@react-three/drei";
import { Html } from "@react-three/drei";

import BarChart from "./BarChart";
import LineChart from "./LineChart";
import Background from "./Background"

const animationConfig = { mass: 1.3, tension: 180, friction: 20 };
const PLANE_OPACITY = 0.8;

const Node = ({ position, color, size, children }) => {
  const ref = useRef();

  const spring = useSpring({
    to: { position },
    config: animationConfig,
  });

  useFrame(() => {
    const currentPosition = spring.position.get();
    ref.current.position.copy(new THREE.Vector3(...currentPosition));
  });

  return (
    <mesh ref={ref} position={spring.position.get()} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} />
      <mesh>{children}</mesh>
    </mesh>
  );
};

const Line = ({ start, end, lineWidth = 0.5 }) => {
  const group = useRef();
  const line1 = useRef();
  const line2 = useRef();

  const spring = useSpring({
    to: { start, end },
    config: animationConfig,
  });

  useFrame(() => {
    const currentStart = spring.start.get();
    const currentEnd = spring.end.get();
    if (currentStart && currentEnd) {
      line1.current.setPoints(currentStart, currentEnd);
      line2.current.setPoints(currentStart, currentEnd);
    }
  });

  useFrame((_, delta) => {
    line1.current.material.uniforms.dashOffset.value -= delta * 10;
  });

  return (
    <group ref={group}>
      <QuadraticBezierLine
        ref={line1}
        start={spring.start.get()}
        end={spring.end.get()}
        color="yellow"
        dashed
        dashScale={50}
        gapSize={20}
      />
      <QuadraticBezierLine
        ref={line2}
        start={spring.start.get()}
        end={spring.end.get()}
        color="#F1C40F"
        lineWidth={lineWidth}
        transparent
        opacity={0.3}
      />
    </group>
  );
};

function CameraAnimation({ position }) {
  useFrame((state) => {
    if (state.camera.position !== position) {
      // state.camera.lookAt(0, 2, 0);
      state.camera.position.lerp(new THREE.Vector3(...position), 0.02);
    }
  });

  return null;
}

const Node1 = ({
  position,
  showListPlane = false,
  showDetailPlane = false,
}) => {
  return (
    <Node position={position} color="#EDBB99" size={0.5}>
      {showListPlane && (
        <Plane
          args={[4, 1]}
          position={[-2.7, 0, 0]}
          rotation={[-Math.PI, 0, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
      {showDetailPlane && (
        <Plane
          args={[1.6, 2.2]}
          position={[-1.25, -0.3, -0.55]}
          rotation={[-Math.PI, Math.PI / 6, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
          <mesh position={[0.4, -0.4, 0.1]}>
            <BarChart />
          </mesh>
          <mesh position={[-0.4, -0.6, 0.1]}>
            <LineChart />
          </mesh>
        </Plane>
      )}
    </Node>
  );
};

const Node2 = ({ position, showListPlane = false, isShowCombined = false }) => {
  return (
    <Node position={position} color="#A9DFBF" size={0.5}>
      {showListPlane && (
        <Plane
          args={[4, 1]}
          position={[-2.7, 0, 0]}
          rotation={[-Math.PI, 0, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
      {isShowCombined && (
        <Plane
          args={[2.8, 1]}
          position={[-1.8, 0, -1]}
          rotation={[-Math.PI, Math.PI / 8, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
    </Node>
  );
};

const Node3 = ({ position, showListPlane = false }) => {
  return (
    <Node position={position} color="#D2B4DE" size={0.5}>
      {showListPlane && (
        <Plane
          args={[4, 1]}
          position={[-2.7, 0, 0]}
          rotation={[-Math.PI, 0, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
    </Node>
  );
};

const Node4 = ({ position, isShowCombined = false }) => {
  return (
    <Node position={position} color="#E6B0AA" size={0.3}>
      {isShowCombined && (
        <Plane
          args={[2.8, 0.5]}
          position={[-1.8, 0, -1]}
          rotation={[-Math.PI, Math.PI / 8, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
    </Node>
  );
};

const Node5 = ({ position, isShowCombined = false }) => {
  return (
    <Node position={position} color="#F9E79F" size={0.3}>
      {isShowCombined && (
        <Plane
          args={[2.8, 0.5]}
          position={[-1.8, 0, -1]}
          rotation={[-Math.PI, Math.PI / 8, 0]}
        >
          <meshBasicMaterial transparent opacity={PLANE_OPACITY} />
        </Plane>
      )}
    </Node>
  );
};

const Node6 = ({ position }) => {
  return <Node position={position} color="#A9CCE3" size={0.3} />;
};

const Node7 = ({ position }) => {
  return <Node position={position} color="#ABEBC6" size={0.1} />;
};

function App() {
  const [cameraPosition, setCameraPosition] = useState([0, 5, -10]);

  const [nodes, setNodes] = useState([
    {
      id: 1,
      position: [-2, 1, 3],
      showListPlane: false,
      showDetailPlane: false,
      node: Node1,
    },
    { id: 2, position: [3, 2, 0], node: Node2 },
    { id: 3, position: [0, 3, -3], node: Node3 },

    { id: 4, position: [3.5, 1, 0], node: Node4 },
    { id: 5, position: [4, 1.5, 1], node: Node5 },
    { id: 6, position: [-3, 2, 3], node: Node6 },

    { id: 7, position: [4, 2, 3], node: Node7 },
  ]);
  const [edges, setEdges] = useState([
    { start: 1, end: 2, lineWidth: 3 },
    { start: 1, end: 3, lineWidth: 2 },
    { start: 2, end: 3 },

    { start: 1, end: 6, lineWidth: 3 },
    { start: 2, end: 4 },
    { start: 2, end: 5 },

    { start: 5, end: 7 },
  ]);

  const getNodeById = (id) => nodes.find((node) => node.id === id);

  const updateNodes = (updates) => {
    setNodes(
      nodes.map((node) =>
        node.id in updates ? { ...node, ...updates[node.id] } : node
      )
    );
  };

  const setSceneHome = (e) => {
    e.preventDefault();
    updateNodes({
      1: { position: [-2, 1, 3], showListPlane: false, showDetailPlane: false },
      2: { position: [3, 2, 0], showListPlane: false, isShowCombined: false },
      3: { position: [0, 3, -3], showListPlane: false },
      4: { position: [3.5, 1, 0], isShowCombined: false },
      5: { position: [4, 1.5, 1], isShowCombined: false },
      6: { position: [-3, 2, 3] },
      7: { position: [4, 2, 3] },
    });
    setCameraPosition([0, 5, -10]);
  };

  const setSceneList = (e) => {
    e.preventDefault();
    updateNodes({
      1: { position: [3, 4, -4], showListPlane: true, showDetailPlane: false },
      2: { position: [3, 2.5, -4], showListPlane: true, isShowCombined: false },
      3: { position: [3, 1, -4], showListPlane: true },
      4: { position: [5.2, 2, 0], isShowCombined: false },
      5: { position: [6.1, 3.2, 0], isShowCombined: false },
      6: { position: [5.3, 5.5, 0] },
      7: { position: [4.5, 4, 1] },
    });
    setCameraPosition([3, 2.5, -12]);
  };

  const setDetail = (e) => {
    e.preventDefault();
    updateNodes({
      1: { position: [3, 4, -4], showListPlane: false, showDetailPlane: true },
      2: {
        position: [3, 2.5, -4],
        showListPlane: false,
        isShowCombined: false,
      },
      3: { position: [3, 1, -4], showListPlane: false },
      4: { position: [5.2, 2, 0], isShowCombined: false },
      5: { position: [6.1, 3.2, 0], isShowCombined: false },
      6: { position: [5.3, 5.5, 0] },
      7: { position: [4.5, 4, 1] },
    });
    setCameraPosition([3.5, 4.5, -7]);
  };

  const setCombine = (e) => {
    e.preventDefault();
    updateNodes({
      1: { position: [2, 7, 4], showListPlane: false, showDetailPlane: false },
      2: { position: [3, 2.5, -4], showListPlane: false, isShowCombined: true },
      3: { position: [4.5, 1, 3], showListPlane: false },
      4: { position: [3, 1.3, -4], isShowCombined: true },
      5: { position: [3, 0.5, -4], isShowCombined: true },
      6: { position: [4.1, 5.5, 0] },
      7: { position: [4.5, 4, 1] },
    });
    setCameraPosition([3.5, 2.3, -9]);
  };

  return (
    <div className="App">
      <VRButton />
      <ARButton />
      <Canvas
        shadows
        camera={{
          position: cameraPosition,
          rotation: [0, 0, 0],
          // fov: 35,
        }}
      >
        <XR>
          <Controllers />
          <Hands />

          <ambientLight intensity={0.5} />
          {/* <color attach="background" args={["#1B2631"]} /> */}
          <spotLight intensity={100} position={[5, 5, -5]} castShadow />

          <Background />

          <CameraAnimation position={cameraPosition} />

          {nodes.map((node, index) => {
            const { id, node: NodeComponent, ...rest } = node;
            return <NodeComponent key={id} {...rest} />;
          })}
          {edges.map((edge, index) => {
            const nodeStart = getNodeById(edge.start);
            const nodeEnd = getNodeById(edge.end);
            return (
              <Line
                key={index}
                start={nodeStart.position}
                end={nodeEnd.position}
                lineWidth={edge.lineWidth}
              />
            );
          })}

          {/* <EffectComposer>
          <DepthOfField focusDistance={0.1} focalLength={0.1} bokehScale={0.5} />
        </EffectComposer> */}

          {/* <gridHelper args={[10, 10]} /> */}
          <OrbitControls target={[0, 3, 0]} />
          <axesHelper />
          {/* <Stats /> */}
        </XR>
      </Canvas>

      <div id="menu">
        <a onClick={(e) => setSceneHome(e)}>Home</a>
        <a onClick={(e) => setSceneList(e)}>List</a>
        <a onClick={(e) => setDetail(e)}>Detail</a>
        <a onClick={(e) => setCombine(e)}>Combined</a>
      </div>

      <div id="logo">Logo</div>
      <div id="profile">User</div>
      <div id="notify">Notify</div>
      <div id="dashboard"></div>
    </div>
  );
}

export default App;
