// Keep real Three.js geometry, materials, cameras and controls. Only the GPU
// endpoint is replaced so Node can exercise the complete scene/frame lifecycle.
export * from '../dist/vendor/three.module.min.js';
export class WebGLRenderer {
 constructor({canvas}){this.domElement=canvas;this.shadowMap={};this.calls=0;(globalThis.__ventoTestRenderers??=[]).push(this);}
 setPixelRatio(){}
 setClearColor(){}
 setSize(){}
 render(scene,camera){this.scene=scene;this.camera=camera;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);this.calls++;}
}
