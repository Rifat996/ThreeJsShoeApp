
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useState, useRef, Suspense, useLayoutEffect } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TextureLoader } from 'expo-three';
import { useAnimatedSensor, SensorType } from 'react-native-reanimated';


function Box(props) {
  const [active, setActive] = useState(false);
  const mesh = useRef();

  useFrame((state, delta) => {
    if (active) {
    mesh.current.rotation.y -= delta * 5;
    mesh.current.rotation.x += delta;
    }
  });

  return (
      <mesh 
      {...props} 
      scale={active ? 1 : 0.5} 
      ref={mesh}
      onClick={(event) => setActive(!active)}>
        <boxGeometry />
        <meshStandardMaterial color={active ? 'green' : 'grey'}/>
      </mesh>
  )
}

function Shoe (props) {
  const [base, normal, rough] = useLoader(TextureLoader, [
    require('./assets/Airmax/textures/BaseColor.jpg'),
    require('./assets/Airmax/textures/Normal.jpg'),
    require('./assets/Airmax/textures/Roughness.png')
  ]); 
  
  const material = useLoader(MTLLoader, require('./assets/Airmax/shoe.mtl'));

  const obj = useLoader(
    OBJLoader, 
    require('./assets/Airmax/shoe.obj'), 
    (loader) => {
    material.preload();
    loader.setMaterials(material);
    }
  );

  const mesh = useRef();

  useLayoutEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = base;
        child.material.normalMap = normal;
        child.material.roughnessMap = rough;
      }
    })
  }, [obj]);

  useFrame((state, delta) => {
    let { x, y, z } = props.animatedSensor.sensor.value;
    x = ~~(x * 100) / 5000;
    y = ~~(y * 100) / 5000;
    mesh.current.rotation.x += x;
    mesh.current.rotation.y += y;
    
  });

  return (
  <mesh ref={mesh} rotation={[0.7, 0, 0]}>
    <primitive object={obj} scale={12}/>
  </mesh>
  ) 
}

export default function App() {
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 100,
  });


  return (
    <Canvas>
      <ambientLight />

      <pointLight position={[10, 10, 10]}/>

      <Suspense fallback={null}>
      <Shoe animatedSensor={animatedSensor}/>
      </Suspense>


      {/* <Box position={[-1, -1, 0]}/>

      <Box position={[1, 1, 0]}/> */}
      

    </Canvas>
  );
}
