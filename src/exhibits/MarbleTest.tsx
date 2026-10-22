import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, useGLTF } from '@react-three/drei';

// Public files are served from the site root, so /public/model/foo.glb is
// addressed as /model/foo.glb. Add each GLB filename from that directory here.
const models = ['/models/marble.glb'];

function GLBModel({ src }: { src: string }) {
	const { scene } = useGLTF(src);
	return <primitive object={scene} />;
}

export default function MarbleTest() {
	return (
		<GLBModel src={models[0]} />
	);
}
