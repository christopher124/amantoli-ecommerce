import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var noUiSlider: any;
declare var $: any;

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

  constructor(
    private _clienteService: ClienteService,
    private _route: ActivatedRoute
  ) {
    this.url = GLOBAL.url;
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
}
