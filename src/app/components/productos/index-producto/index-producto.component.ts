import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
import { GuestService } from 'src/app/services/guest.service';

declare var noUiSlider: any;
declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css'],
})
export class IndexProductoComponent implements OnInit {
  public config_global: any = {};
  public filter_categoria = '';
  public productos: Array<any> = [];
  public filter_producto = '';
  public filter_cat_productos = 'Todos';
  public load_data = true;
  public url;
  public route_categoria: any;
  public page = 1;
  public pageSize = 15;
  public sort_by = 'Defecto';
  public carrito_data: any = {
    variedad: '',
    cantidad: 1,
  };
  public producto: any = {};
  public btn_cart = false;
  public token;
  public socket = io('http://localhost:4201');
  public descuento_activo: any = undefined;

  constructor(
    private _clienteService: ClienteService,
    private _route: ActivatedRoute,
    private _guestService: GuestService
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this._clienteService.obtener_config_public().subscribe(
      (res) => {
        this.config_global = res.data;
      },
      (err) => {}
    );

    this._route.params.subscribe((params) => {
      this.route_categoria = params['categoria'];
      if (this.route_categoria) {
        this._clienteService.listar_productos_publico('').subscribe(
          (res) => {
            this.productos = res.data;
            this.productos = this.productos.filter(
              (i) => i.categoria.toLowerCase() == this.route_categoria
            );
            this.load_data = false;
          },
          (err) => {}
        );
      } else {
        this._clienteService.listar_productos_publico('').subscribe(
          (res) => {
            this.productos = res.data;
            this.load_data = false;
          },
          (err) => {}
        );
      }
    });
  }

  ngOnInit(): void {
    var slider: any = document.getElementById('slider');

    noUiSlider.create(slider, {
      start: [0, 10000],
      connect: true,
      range: {
        min: 0,
        max: 10000,
      },
      tooltips: [true, true],
      pips: {
        mode: 'count',
        values: 5,
      },
    });

    slider.noUiSlider.on('update', function (values: any) {
      $('.cs-range-slider-value-min').val(values[0]);
      $('.cs-range-slider-value-max').val(values[1]);
    });
    $('.noUi-tooltip').css('font-size', '11px');

    this._guestService.obtener_descuento_activo().subscribe((res) => {
      this.descuento_activo = res.data[0];
      console.log(this.descuento_activo);
    });
  }
  buscar_categoria() {
    if (this.filter_categoria) {
      var search = new RegExp(this.filter_categoria, 'i');
      this.config_global.categorias = this.config_global.categorias.filter(
        (item: { titulo: string }) => search.test(item.titulo)
      );
    } else {
      this._clienteService.obtener_config_public().subscribe(
        (res) => {
          this.config_global = res.data;
        },
        (err) => {}
      );
    }
  }
  buscar_producto() {
    this._clienteService
      .listar_productos_publico(this.filter_producto)
      .subscribe(
        (res) => {
          this.productos = res.data;
          this.load_data = false;
        },
        (err) => {}
      );
  }
  buscar_precios() {
    this._clienteService
      .listar_productos_publico(this.filter_producto)
      .subscribe(
        (res) => {
          this.productos = res.data;
          let min = parseInt($('.cs-range-slider-value-min').val());
          let max = parseInt($('.cs-range-slider-value-max').val());

          console.log(min, max);
          this.productos = this.productos.filter((i) => {
            return i.precio >= min && i.precio <= max;
          });
        },
        (err) => {}
      );
  }
  buscar_por_categoria() {
    if (this.filter_cat_productos == 'Todos') {
      this._clienteService
        .listar_productos_publico(this.filter_producto)
        .subscribe(
          (res) => {
            this.productos = res.data;

            this.load_data = false;
          },
          (err) => {}
        );
    } else {
      this._clienteService
        .listar_productos_publico(this.filter_producto)
        .subscribe(
          (res) => {
            this.productos = res.data;

            this.productos = this.productos.filter(
              (i) => i.categoria == this.filter_cat_productos
            );
            this.load_data = false;
          },
          (err) => {}
        );
    }
  }
  reset_producto() {
    this.filter_producto = '';
    this.filter_cat_productos = 'Todos';
    this._clienteService.listar_productos_publico('').subscribe(
      (res) => {
        this.productos = res.data;
        this.load_data = false;
      },
      (err) => {}
    );
  }
  order_por() {
    if (this.sort_by == 'Defecto') {
      this._clienteService.listar_productos_publico('').subscribe((res) => {
        this.productos = res.data;
        this.load_data = false;
      });
      console.log(this.sort_by);
    } else if (this.sort_by == 'Popularidad') {
      console.log(this.sort_by);
      this.productos.sort(function (a, b) {
        if (a.nventas < b.nventas) {
          return 1;
        }
        if (a.nventas > b.nventas) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    } else if (this.sort_by == '+-Precio') {
      console.log(this.sort_by);
      this.productos.sort(function (a, b) {
        if (a.precio < b.precio) {
          return 1;
        }
        if (a.precio > b.precio) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    } else if (this.sort_by == '-+Precio') {
      console.log(this.sort_by);
      this.productos.sort(function (a, b) {
        if (a.precio > b.precio) {
          return 1;
        }
        if (a.precio < b.precio) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    } else if (this.sort_by == 'azTitulo') {
      console.log(this.sort_by);
      this.productos.sort(function (a, b) {
        if (a.titulo > b.titulo) {
          return 1;
        }
        if (a.titulo < b.titulo) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    } else if (this.sort_by == 'zaTitulo') {
      console.log(this.sort_by);
      this.productos.sort(function (a, b) {
        if (a.titulo < b.titulo) {
          return 1;
        }
        if (a.titulo > b.titulo) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    }
  }

  agregar_producto(producto: any) {
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
      cantidad: 1,
      variedad: producto.variedades[0].titulo,
    };
    this.btn_cart = true;
    this._clienteService.agregar_carrito_cliente(data, this.token).subscribe(
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
  }
}
