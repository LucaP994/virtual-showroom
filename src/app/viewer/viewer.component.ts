import { Component } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import gsap from 'gsap';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [NgIf],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent {
  public camerax: number = - 2;
  public cameray: number = 0.85;
  public cameraz: number = 2.5;
  public camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  public renderer = new THREE.WebGLRenderer({ antialias: true, depth: true });
  public scene: THREE.Scene = new THREE.Scene();
  currentView: number = 0;
  loading: boolean = false;
  ngAfterViewInit() {
    this.loading = true;
    let changeColor: HTMLElement = document.querySelector('.color-box')!;
    let changeView: HTMLElement = document.querySelector('.view-box')!;
    let infoBox: HTMLElement = document.querySelector('.info-box')!;
    changeColor.addEventListener('mouseover',(el)=>{
      changeColor.classList.remove('hidden')
    })
    changeColor.addEventListener('mouseout',(el)=>{
      changeColor.classList.add('hidden')
    })
    changeView.addEventListener('mouseover',(el)=>{
      changeView.classList.remove('view-hidden')
    })
    changeView.addEventListener('mouseout',(el)=>{
      changeView.classList.add('view-hidden')
    })
    infoBox.addEventListener('mouseover',(el)=>{
      infoBox.classList.remove('info-hidden')
    })
    infoBox.addEventListener('mouseout',(el)=>{
      infoBox.classList.add('info-hidden')
    })
    let container: HTMLElement = document.querySelector('.viewer')!;
    container.style.width = "100%";
    container.style.height = "100vh";
    this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.initScene(this.renderer,this.camera,this.scene, container);

  }
  initScene(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene, container: HTMLElement){
    let loader: HTMLElement = document.querySelector('.loader')!;
    let loadText: HTMLElement = loader.querySelector('.loader h2')!;
    setInterval(()=>{
      loadText.innerText = loadText.innerText+"."
    },400)
    camera.position.set(this.camerax, this.cameray, this.cameraz);
    let renderFunc: any = this.render;
    let carPos: THREE.Vector3 = new THREE.Vector3()
    var geometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
    // change floor color
    const asphalt = new THREE.TextureLoader().load("assets/images/alphalt.jpg");
    asphalt.wrapS = THREE.RepeatWrapping;
    asphalt.wrapT = THREE.RepeatWrapping;
    asphalt.repeat.set(1000, 1000);
    var material = new THREE.MeshPhysicalMaterial({ map: asphalt, color: 0x696969 });
    var floor = new THREE.Mesh(geometry, material)
    floor.material.side = THREE.DoubleSide
    floor.rotation.x = 90 * Math.PI / 180
    scene.add(floor)
    new RGBELoader()
      .setPath('assets/images/')
      .load('royal_esplanade_1k.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

        const light = new THREE.PointLight(0x404040); // soft white light
        light.castShadow = true;
        light.visible = true;
        light.power = 5000
        light.translateZ(1)
        light.translateY(3)
        light.translateX(3)
        const light2 = new THREE.PointLight(0x404040); // soft white light
        light2.castShadow = true;
        light2.visible = true;
        light2.power = 10000
        light2.translateZ(-1)
        light2.translateY(3)
        light2.translateX(-3)
        const light3 = new THREE.PointLight(0x404040); // soft white light
        light3.castShadow = true;
        light3.visible = true;
        light3.power = 2500
        light3.translateZ(2)
        light3.translateY(3)
        light3.translateX(-3)
        const width = 10;
        const height = 10;
        const intensity = 5;
        const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
        rectLight.castShadow = true;
        rectLight.visible = true;
        rectLight.position.set(-1, 5, 0);
        rectLight.lookAt(0, 0, 0);

        scene.add(light, light2, light3, rectLight);

        renderFunc(renderer, scene, camera);
        const loader = new GLTFLoader().setPath("assets/models/");
        loader.load('warehouse/scene.gltf', function (gltf) {
          const model = gltf.scene
          //await renderer.compileAsync(model, camera, scene);
          scene.add(model);
          
          model.castShadow = true;
          model.translateX(5)
          model.translateZ(6)
          model.translateY(3)
          renderFunc(renderer, scene, camera)

        }, undefined, function (err) {
          console.log(err)
        });
        loader.load('porsche/untitled.gltf', function (gltf) {
          const model = gltf.scene
          scene.add(model);
          camera.lookAt(0, 0, 0)

          model.rotateY(5);
          model.castShadow = true;
          model.name = "car"

          renderFunc(renderer, scene, camera)
        });
      });
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', evt => {
      renderFunc(renderer, scene, camera)
    }); // use if there is no animation loop
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controls.enablePan = true;
    controls.update();
    setTimeout(() => {
      loader.classList.add('d-hidden');
      setTimeout(() => {
        loader.style.display = "none";
      },500)
    },4000)
  }
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    console.log(camera)
    renderer.render(scene, camera);
  }
  nextPos() {
    const renderFunc = this.render;
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    switch (this.currentView) {
      case 0:
        //vista retro
        gsap.to(camera.position, {
          x: 2.67, y: 0.94, z: 1.03, duration: 3, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView++;
        break;
      case 1:
        //vista tetto S
        gsap.to(camera.position, {
          x: 1.67, y: 2.5, z: 2.03, duration: 3, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView++;
        break;
      case 2:
        //vista Destra
        gsap.to(camera.position, {
          x: -3.5, y: 1.5, z: -2.03, duration: 4, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView++;
        break;
      case 3:
        //vista Iniziale
        gsap.to(camera.position, {
          x: -2, y: 0.85, z: 2.5, duration: 4, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView = 0;
        break;
    }
  }
  prevPos() {
    const renderFunc = this.render;
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    switch (this.currentView) {
      case 2:
        //vista retro
        gsap.to(camera.position, {
          x: 2.67, y: 0.94, z: 1.03, duration: 3, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView--;
        break;
      case 3:
        //vista tetto S
        gsap.to(camera.position, {
          x: 1.67, y: 2.5, z: 2.03, duration: 3, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView--;
        break;
      case 0:
        //vista Destra
        gsap.to(camera.position, {
          x: -3.5, y: 1.5, z: -2.03, duration: 4, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView = 3;
        break;
      case 1:
        //vista Iniziale
        gsap.to(camera.position, {
          x: -2, y: 0.85, z: 2.5, duration: 4, ease: "expo.inOut", onUpdate: function () {
            camera.lookAt(0, 0, 0)
            renderFunc(renderer, scene, camera)
          }
        })
        this.currentView--;
        break;
    }
  }
  resetPos() {
    const renderFunc = this.render;
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    gsap.to(camera.position, {
      x: -2, y: 0.85, z: 2.5, duration: 4, ease: "expo.inOut", onUpdate: function () {
        camera.lookAt(0, 0, 0)
        renderFunc(renderer, scene, camera)
      }
    })
    this.currentView = 0;
  }
  changeColor(color: string) {
    const renderFunc = this.render;
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    let car: THREE.Object3D = this.scene.getObjectByName("car")!;
    console.log(car)

    car.children.forEach((mesh: any) => {
      let paint: THREE.MeshPhysicalMaterial = mesh.children[0].children[0].children.filter((ch: any) => ch.children[0].material.name == "paint")[0].children[0].material
      const newColor: THREE.Texture = new THREE.TextureLoader().load(`assets/models/porsche/textures/${color}.png`);
      let originalTex: THREE.Texture = paint.map!.clone()
      console.log(originalTex)
      originalTex.source = newColor.source
      paint.map = originalTex;
      console.log(paint.map)
      
    })
    setTimeout(() => {
      renderFunc(renderer, scene, camera)
    }, 500)
  }
}
