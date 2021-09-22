import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { extend, useFrame, useThree } from '@react-three/fiber';
// import { Geometry } from 'three-stdlib';

const getLorenzSystem = (points = 10000) => {
  const h = 0.1;
  const sigma = 10.0;
  const rho = 28.0;
  const beta = 8.0 / 3.0;

  const vertices = [];

  let start = { x: 0.01, y: 0, z: 0 };
  let end = { ...start };

  for (let i = 0; i < points; i++) {
    end.x = start.x + h * sigma * (start.y - start.x);
    end.y = start.y + h * (start.x * (rho - start.z) - start.y);
    end.z = start.z + h * (start.x * start.y - beta * start.z);

    start = { ...end };

    // if (i > 100) {
    vertices.push({ ...start });
    // }
  }

  return vertices;
};

const testLorenz = (size = 100000, seed) => {
  let arrayCurve = [];

  let x = 0.01,
    y = 0.01,
    z = 0.01;
  let a = 0.9;
  let b = 3.4;
  let f = 9.9;
  let g = 1;
  let t = 0.1;
  for (let i = 0; i < size; i++) {
    let x1 = x;
    let y1 = y;
    let z1 = z;
    const inv = seed.random() > 0.5 ? -1 : 1;
    const inv2 = seed.random() > 0.5 ? -1 : 1;
    const inv3 = seed.random() > 0.5 ? -1 : 1;

    x = inv * 20.5 * seed.random();
    y = inv2 * 20.5 * seed.random();
    z = inv3 * 20.5 * seed.random();
    x = x - t * a * x + t * y * y - t * z * z + t * a * f;
    y = y - t * y + t * x * y - t * b * x * z + t * g;
    z = z - t * z + t * b * x * y + t * x * z;
    arrayCurve.push(new THREE.Vector3(x, y, z).multiplyScalar(1));
  }

  return arrayCurve;
};

let step = 0;
// random, hourglass1, hourglass2, clock, test
const ANIM = {
  default: (seed) => {
    const a = 50.0 * seed.random();
    const f = 140.0 * seed.random();
    const b = (40.0 * seed.random()) / (30.0 * seed.random());

    return [a, b, f];
  },
  // default: (seed) => {
  //   const a = 10.0 * seed.random();
  //   const f = 28.0 * seed.random();
  //   const b = (8.0 * seed.random()) / 3.0;

  //   return [a, b, f];
  // },
  test: (seed) => {
    const f = 0.9 + seed.random() * 3;
    const a = 3.4 + seed.random() * 6;
    const b = 10.6 * seed.random() * 1;

    return [a, b, f];
  },
};

function Cloud({
  color = '#000',
  formula = null,
  geo = null,
  normalize = false,
  seed,
  position,
}) {
  const mesh = useRef();
  // const node3d = (props) => <lines {...props} />;

  const vertices = useMemo(() => {
    let geometry = geo;

    // if (normalize) {
    //   let vertex = new THREE.Vector3();
    //   geometry = geo.map((point) => {
    //     const { x, y, z } = point;
    //     return vertex.set(x, y, z).clone().multiplyScalar(1);
    //   });
    // }

    const curve = new THREE.CatmullRomCurve3(geometry);

    return curve.getPoints(geo.length);
  }, [geo, normalize, seed]);

  const ref = useRef();

  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.setFromPoints(vertices);
  }, [vertices]);

  // const ref = useUpdate(
  //   (geometry) => {
  //     geometry
  //   },
  //   [vertices]
  // );

  // useHelper(ref, THREE.BoxHelper, "#ccc");

  const animationFormula = useMemo(() => {
    const animation = ANIM.test(seed);

    console.log('[cloud.anim] fallback to random anim...', animation);

    return animation;
  }, [formula, seed]);

  // console.log("ANIM formula constants: ", animationFormula);

  // console.log(ref.current, mesh.current, 'la');
  useFrame(() => {
    const geo = ref.current;
    // console.log(geo, geo.vertices, 'lalalalala');

    if (!geo) return;

    const [a, b, f] = animationFormula; // ANIM.random();
    const g = 1 * seed.random();
    const t = 0.005;

    // const pos = mesh.current.geometry.getAttribute('position');
    // for (let i = 0; i <= state.points.length; i ++) {
    //   pos.array[i] = state.points[i]
    // }
    // refPoints.current.geometry.setAttribute('position', pos);
    // refPoints.current.geometry.attributes.position.needsUpdate = true;
    // state.requireUpdate = false;

    vertices.forEach((v) => {
      v.x -= t * a * v.x + t * v.y * v.y - t * v.z * v.z + t * a * f;
      v.y -= t * v.y + t * v.x * v.y - t * b * v.x * v.z + t * g;
      v.z -= t * v.z + t * b * v.x * v.y + t * v.x * v.z;
    });

    geo.setFromPoints(vertices);
    geo.verticesNeedUpdate = true;
  });

  return (
    <>
      <points
        ref={mesh}
        rotation={[0.2 * Math.PI, 0.5 * Math.PI, 0.2 * Math.PI]}
        position={[0, 0, 1.8]}
      >
        <bufferGeometry attach="geometry" ref={ref} />
        <pointsMaterial
          attach="material"
          color={'black'}
          // transparent
          size={2}
          vertexColors
          blending={THREE.AdditiveBlending}
          // sizeAttenuation
          // sortPoints
        />
      </points>
    </>
  );
}

function Test({ count, colors, seed }) {
  const { camera } = useThree();
  const group = useRef();

  // const { geo, normalize, speed } = useMemo(() => {
  //   return {
  //     normalize: false,
  //     geo: [...getLorenzSystem(10000)],
  //     speed: Math.max(0.0001, 0.0005 * Math.random()),
  //   };
  // }, []);

  return (
    <>
      <group ref={group}>
        <Cloud
          geo={[...testLorenz(10000, seed)]}
          seed={seed}
          normalize
          color={'red'}
        />
      </group>
    </>
  );
}

export default Test;
