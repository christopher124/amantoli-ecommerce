import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { GuestService } from 'src/app/services/guest.service';
// Importaciones THREE.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {
  AmbientLight,
  CubeTextureLoader,
  DirectionalLight,
  PerspectiveCamera,
  Raycaster,
  sRGBEncoding,
  Vector2,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
//Final de importaciones de three.js

declare var tns: any;
declare var lightGallery: any;
@Component({
  selector: 'app-show-producto',
  templateUrl: './show-producto.component.html',
  styleUrls: ['./show-producto.component.css'],
})
export class ShowProductoComponent implements OnInit {
  public slug: any;
  public producto: any = {};
  public url;
  public productos_rec: Array<any> = [];
  constructor(
    private _route: ActivatedRoute,
    private _guestService: GuestService
  ) {
    this.url = GLOBAL.url;
    this._route.params.subscribe((params) => {
      this.slug = params['slug'];

      this._guestService.obtener_productos_slug_publico(this.slug).subscribe(
        (res) => {
          this.producto = res.data;

          this._guestService
            .listar_productos_recomendados_publico(this.producto.categoria)
            .subscribe(
              (res) => {
                this.productos_rec = res.data;
              },
              (err) => {}
            );
        },
        (err) => {}
      );
    });
  }

  ngOnInit(): void {
    this.main();
    setTimeout(() => {
      tns({
        container: '.cs-carousel-inner',
        controlsText: [
          '<i class="cxi-arrow-left"></i>',
          '<i class="cxi-arrow-right"></i>',
        ],
        navPosition: 'top',
        controlsPosition: 'top',
        mouseDrag: !0,
        speed: 600,
        autoplayHoverPause: !0,
        autoplayButtonOutput: !1,
        navContainer: '#cs-thumbnails',
        navAsThumbnails: true,
        gutter: 15,
      });
      var e = document.querySelectorAll('.cs-gallery');
      if (e.length) {
        for (var t = 0; t < e.length; t++) {
          lightGallery(e[t], {
            selector: '.cs-gallery-item',
            download: !1,
            videojs: !0,
            youtubePlayerParams: { modestbranding: 1, showinfo: 0, rel: 0 },
            vimeoPlayerParams: { byline: 0, portrait: 0 },
          });
        }
      }
      tns({
        container: '.cs-carousel-inner-two',
        controlsText: [
          '<i class="cxi-arrow-left"></i>',
          '<i class="cxi-arrow-right"></i>',
        ],
        navPosition: 'top',
        controlsPosition: 'top',
        mouseDrag: !0,
        speed: 600,
        autoplayHoverPause: !0,
        autoplayButtonOutput: !1,
        nav: false,
        controlsContainer: '#custom-controls-related',
        responsive: {
          0: {
            items: 1,
            gutter: 20,
          },
          480: {
            items: 2,
            gutter: 24,
          },
          700: {
            items: 3,
            gutter: 24,
          },
          1100: {
            items: 4,
            gutter: 30,
          },
        },
      });
    }, 500);
  }

  reRender() {
    const event = new Event('resize');
    setTimeout(() => {
      dispatchEvent(event);
    });
  }

  main() {
    const gltfLoader = new GLTFLoader();
    const scene = new THREE.Scene();

    const container: any = document.querySelector('.canvas');
    document.styleSheets[0].insertRule(
      'canvas { outline:none; border:none; }',
      0
    );

    //Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, aspect, 1, 1000);
    camera.position.x = -12;
    camera.position.z = 1;
    camera.position.y = 1;
    scene.add(camera);

    // Light
    const ambientLight = new AmbientLight(0x323232);
    const mainLight = new DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(-12, 1, 1);
    scene.add(ambientLight, mainLight);

    const light = new THREE.DirectionalLight(0x000000, 1);
    light.position.set(50, 50, 10);
    scene.add(light);

    const plight = new THREE.PointLight(0x6ce0ff, 2, 100);
    plight.position.set(50, 50, 50);
    scene.add(plight);

    const lightProbe = new THREE.LightProbe();
    scene.add(lightProbe);

    //Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // tone mapping
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    //Load Model
    gltfLoader.load(
      '../../../../assets/modelos3D/marco-imagenRR.glb',
      (gltf: any) => {
        gltf.scene.scale.set(3, 3, 3); //Tamaño
        gltf.scene.rotation.set(0, -1, 0);
        gltf.scene.position.set(1, -4, 1);
        scene.add(gltf.scene);
      }
    );

    // Controls Livre
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1, 1, 1); //POSICION
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;
    controls.update();

    const clock = new THREE.Clock();

    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();
  }
}
