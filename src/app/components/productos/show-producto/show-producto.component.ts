import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { GuestService } from 'src/app/services/guest.service';
declare var tns: any;
declare var lightGallery: any;
declare var iziToast: any;
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
  public carrito_data: any = {
    variedad: '',
    cantidad: 1,
  };
  public token;
  public btn_cart = false;
  public socket = io('http://localhost:4201');
  public descuento_activo: any = undefined;
  public reviews: Array<any> = [];
  public page = 1;
  public pageSize = 15;
  public total_puntos = 0;
  public max_puntos = 0;
  public count_five_start = 0;
  public count_four_start = 0;
  public count_three_start = 0;
  public count_two_start = 0;
  public count_one_start = 0;
  public porcent_raiting = 0;
  public puntos_raiting = 0;

  public cinco_porcent = 0;
  public cuatro_porcent = 0;
  public tres_porcent = 0;
  public dos_porcent = 0;
  public uno_porcent = 0;

  constructor(
    private _route: ActivatedRoute,
    private _guestService: GuestService,
    private _clienteService: ClienteService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this._route.params.subscribe((params) => {
      this.slug = params['slug'];

      this._guestService.obtener_productos_slug_publico(this.slug).subscribe(
        (res) => {
          this.producto = res.data;

          this._guestService
            .listar_reviews_producto_publico(this.producto._id)
            .subscribe((res) => {
              res.data.forEach((element: { estrellas: number }) => {
                if (element.estrellas == 5) {
                  this.count_five_start = this.count_five_start + 1;
                } else if (element.estrellas == 4) {
                  this.count_four_start = this.count_four_start + 1;
                } else if (element.estrellas == 3) {
                  this.count_three_start = this.count_three_start + 1;
                } else if (element.estrellas == 2) {
                  this.count_two_start = this.count_two_start + 1;
                } else if (element.estrellas == 1) {
                  this.count_one_start = this.count_one_start + 1;
                }

                this.cinco_porcent =
                  (this.count_five_start * 100) / res.data.length;
                this.cuatro_porcent =
                  (this.count_four_start * 100) / res.data.length;
                this.tres_porcent =
                  (this.count_three_start * 100) / res.data.length;
                this.dos_porcent =
                  (this.count_two_start * 100) / res.data.length;
                this.uno_porcent =
                  (this.count_one_start * 100) / res.data.length;

                let puntos_cinco = 0;
                let puntos_cuatro = 0;
                let puntos_tres = 0;
                let puntos_dos = 0;
                let puntos_uno = 0;

                puntos_cinco = this.count_five_start * 5;
                puntos_cuatro = this.count_four_start * 4;
                puntos_tres = this.count_three_start * 3;
                puntos_dos = this.count_two_start * 2;
                puntos_uno = this.count_one_start * 1;

                this.total_puntos =
                  puntos_cinco +
                  puntos_cuatro +
                  puntos_tres +
                  puntos_dos +
                  puntos_uno;

                this.max_puntos = res.data.length * 5;

                this.porcent_raiting =
                  (this.total_puntos * 100) / this.max_puntos;
                this.puntos_raiting = (this.porcent_raiting * 5) / 100;
              });

              this.reviews = res.data;
              console.log(res);
            });

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
    this._guestService.obtener_descuento_activo().subscribe((res) => {
      this.descuento_activo = res.data[0];
      console.log(this.descuento_activo);
    });
  }

  agregar_producto() {
    if (this.carrito_data.variedad) {
      if (this.carrito_data.cantidad <= this.producto.stock) {
        let data = {
          producto: this.producto._id,
          cliente: localStorage.getItem('_id'),
          cantidad: this.carrito_data.cantidad,
          variedad: this.carrito_data.variedad,
        };
        this.btn_cart = true;
        this._clienteService
          .agregar_carrito_cliente(data, this.token)
          .subscribe(
            (res) => {
              if (res.data == undefined) {
                iziToast.show({
                  title: 'ERROR',
                  class: 'text-danger',
                  titleColor: '#ff0000',
                  position: 'topRight',
                  message: 'El producto ya existe en el carrito.',
                });
                this.btn_cart = false;
              } else {
                console.log(res);

                iziToast.show({
                  title: 'SUCCESS',
                  class: 'text-success',
                  titleColor: '#1DC74C',
                  position: 'topRight',
                  message: 'Se agrego el producto al carrito.',
                });
                this.socket.emit('add-carrito-add', { data: true });
                this.btn_cart = false;
              }
            },
            (err) => {}
          );
      } else {
        iziToast.show({
          title: 'ERROR',
          class: 'text-danger',
          titleColor: '#ff0000',
          position: 'topRight',
          message: 'La máxima cantidad disponible es: ' + this.producto.stock,
        });
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        class: 'text-danger',
        titleColor: '#ff0000',
        position: 'topRight',
        message: 'Seleccione una variedad de producto.',
      });
    }
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
      (gltf) => {
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
