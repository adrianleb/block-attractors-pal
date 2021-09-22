import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThree, Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import * as THREE from 'three';
import MersenneTwist from 'mersenne-twister';
import Lorenz from './Lorenz';
import {
  TorusKnot,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Reflector,
  Effects,
} from '@react-three/drei';
import Color from 'color';
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
  SSAO,
  HueSaturation,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import {
  useGLTF,
  Stage,
  softShadows,
  Tube,
  Cube,
  Ring,
  Plane,
} from '@react-three/drei';
import { useDrag } from 'react-use-gesture';
import { useSpring, a } from '@react-spring/three';

softShadows({});

/*
Create your Custom style to be turned into a EthBlock.art BlockStyle NFT

Basic rules:
 - use a minimum of 1 and a maximum of 4 "modifiers", modifiers are values between 0 and 1,
 - use a minimum of 1 and a maximum of 3 colors, the color "background" will be set at the canvas root
 - Use the block as source of entropy, no Math.random() allowed!
 - You can use a "shuffle bag" using data from the block as seed, a MersenneTwister library is provided

 Arguments:
  - block: the blockData, in this example template you are given 3 different blocks to experiment with variations, check App.js to learn more
  - mod[1-3]: template modifier arguments with arbitrary defaults to get your started
  - color: template color argument with arbitrary default to get you started

Getting started:
 - Write react-three-fiber code, consuming the block data and modifier arguments,
   make it cool and use no random() internally, component must be pure, output deterministic
 - Customize the list of arguments as you wish, given the rules listed below
 - Provide a set of initial /default values for the implemented arguments, your preset.
 - Think about easter eggs / rare attributes, display something different every 100 blocks? display something unique with 1% chance?

 - check out react-three-fiber documentation for examples!
*/

// Required style metadata
const styleMetadata = {
  name: '',
  description: '',
  image: '',
  creator_name: '',
  options: {
    mod1: 0.4,
    mod2: 0.1,
    mod3: 0.4,
    color1: '#fff000',
    background: '#000000',
    palette: [1, '#fff #000 #fff #000 #f1f'],
  },
};

export { styleMetadata };

function Inner({
  block,
  attributesRef,
  palette,
  mod1 = 0.75, // Example: replace any number in the code with mod1, mod2, or color values
  mod2 = 0.25,
  mod3 = 1,
  color1 = '#4f83f1',
  background = '#ccc',
}) {
  console.log(`rendering`);

  // Props

  //   const { mod1, mod2, mod3, color1 } = options;

  // Refs
  const { hash } = block;
  const seed = parseInt(hash.slice(0, 16), 16);

  const [shuffleBag, setShuffle] = useState(new MersenneTwist(seed));
  const group = useRef();

  // Three
  const { size, camera } = useThree();
  const { width, height } = size;

  // // Handle correct scaling of scene as canvas is resized, and when generating upscaled version.
  useEffect(() => {
    console.log(`updating camera...`);
    let DEFAULT_SIZE = 500;
    let DIM = Math.min(width, height);
    let M = DIM / DEFAULT_SIZE;
    camera.zoom = M * 25;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  useEffect(() => {
    setShuffle(new MersenneTwist(seed));
  }, [block]);
  // Shuffle the random number bag when block changes
  const [color, scale, tori, color2, color3, color4, color5, color6, vs] =
    useMemo(() => {
      console.log(`shuffling...`);

      function ran255() {
        return Math.floor(255 * shuffleBag.random());
      }
      const color = Color([ran255(), ran255(), ran255()]).hex();
      const color2 = Color([0, 0, 0]).hex();
      const color3 = Color([0, 0, 0]).hex();
      const color4 = Color([0, 0, 0]).hex();
      const color5 = Color([0, 0, 0]).hex();
      const color6 = Color([0, 0, 0]).hex();
      const scale = shuffleBag.random() / 100;
      const tori = block.transactions.map((tx, i) => {
        const mul = 1.5;
        const flip = i % 2 ? -1 : 1;
        const flip2 = i % 3 ? -1 : 1;
        const flip3 = i % 4 ? -1 : 1;
        return [
          shuffleBag.random() * mul * flip,
          shuffleBag.random() * mul * flip2,
          shuffleBag.random() * mul * flip3,
        ];
      });

      const vs = [
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
        shuffleBag.random(),
      ];

      // mass: ,
      // friction: Math.ceil(10 + 100 * vs[16]),
      // tension: Math.ceil(100 + 1000 * vs[17]),

      attributesRef.current = () => {
        return {
          // This is called when the final image is generated, when creator opens the Mint NFT modal.
          // should return an object structured following opensea/enjin metadata spec for attributes/properties
          // https://docs.opensea.io/docs/metadata-standards
          // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema

          attributes: [
            {
              display_type: 'number',
              trait_type: 'Lights',
              value: Math.ceil(5 * vs[14]), // using the hoisted value from within the draw() method, stored in the ref.
            },

            {
              trait_type: 'X',
              value: Math.PI / vs[1],
            },
            {
              trait_type: 'Y',
              value: Math.PI / vs[2],
            },
            {
              trait_type: 'Z',
              value: Math.PI / vs[3],
            },
            {
              trait_type: 'mass',
              value: Math.ceil(5 + 10 * vs[15]),
            },
            {
              trait_type: 'friction',
              value: Math.ceil(10 + 100 * vs[16]),
            },
            {
              trait_type: 'tension',
              value: Math.ceil(100 + 1000 * vs[17]),
            },
          ],
        };
      };

      return [color, scale, tori, color2, color3, color4, color5, color6, vs];
    }, [shuffleBag]);

  const lightCount = Math.ceil(5 * vs[14]);

  // Render the scene
  return (
    <>
      {/* <group position={[0, -2, 0]}> */}
      {/* <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -6, 0]}
          receiveShadow
        >
          <planeBufferGeometry attach="geometry" args={[100, 100]} />
          <shadowMaterial
            attach="material"
            transparent
            roughness={0.7}
            metalness={1}
            opacity={1}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.001, 0]}>
          <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
          <meshStandardMaterial
            attach="material"
            color="white"
            roughness={0.7}
            metalness={1}
            opacity={1}
          />
        </mesh> */}

      <Lorenz seed={shuffleBag} color={color2} />
      {/* <Sphere
          mod1={mod1}
          v1={vs[15]}
          v2={vs[16]}
          v3={vs[17]}
          mod2={mod2}
          rotation={[Math.PI / vs[1], Math.PI / vs[2], Math.PI / vs[3]]}
        /> */}

      {/* <Sphere mod1={mod1} mod2={mod2} position={[2, 1, 2]} size={1} />
        <Sphere mod1={mod1} mod2={mod2} position={[-2, 1, -2]} size={1} />
        <Sphere mod1={mod1} mod2={mod2} position={[-2, 1, 2]} size={1} />
        <Sphere mod1={mod1} mod2={mod2} position={[2, 1, -2]} size={1} /> */}
      {/* </group> */}
      <EffectComposer frameBufferType={THREE.HalfFloatType}>
        {/* <SSAO
          blendFunction={BlendFunction.MULTIPLY} // blend mode
          samples={30} // amount of samples per pixel (shouldn't be a multiple of the ring count)
          rings={4} // amount of rings in the occlusion sampling pattern
          distanceThreshold={1.0} // global distance threshold at which the occlusion effect starts to fade out. min: 0, max: 1
          distanceFalloff={0.0} // distance falloff. min: 0, max: 1
          rangeThreshold={0.5} // local occlusion range threshold at which the occlusion starts to fade out. min: 0, max: 1
          rangeFalloff={0.1} // occlusion range falloff. min: 0, max: 1
          luminanceInfluence={0.9} // how much the luminance of the scene influences the ambient occlusion
          radius={20} // occlusion sampling radius
          scale={0.5} // scale of the ambient occlusion
          bias={0.5} // occlusion bias
        /> */}
        {/* <DepthOfField
          focusDistance={2}
          focalLength={10}
          bokehScale={1}
          height={480}
        /> */}
        {/* <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> */}
        <Noise opacity={0.01} />
        {/* <HueSaturation
          blendFunction={BlendFunction.NORMAL} // blend mode
          hue={0} // hue in radians
          saturation={} // saturation in radians
        /> */}
        <Vignette eskil={true} offset={0.1} darkness={0.1} />
        {/* <ToneMapping
          blendFunction={BlendFunction.NORMAL} // blend mode
          adaptive={true} // toggle adaptive luminance map usage
          resolution={1024} // texture resolution of the luminance map
          middleGrey={1} // middle grey factor
          maxLuminance={100.0} // maximum luminance
          averageLuminance={100.0} // average luminance
          adaptationRate={5.0} // luminance adaptation rate
        /> */}
      </EffectComposer>
    </>
  );
}

const Outer = React.memo(({ gl, background, ...props }) => {
  return (
    <Canvas
      key="canvas"
      shadowMap
      colorManagement
      camera={{ position: [10, 10, 1], fov: 65 }}
      orthographic
      dpr={[1, 3]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={(context) => {
        // canvasRef.current = context.gl.domElement;
        gl.current = context.gl;
      }}
      style={{
        touchAction: 'none',
      }}
    >
      <OrbitControls target={(0, 0, 0)} />
      <Inner {...props} />
    </Canvas>
  );
});

export default Outer;
