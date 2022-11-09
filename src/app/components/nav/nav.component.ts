import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  public token;
  public id;
  public user: any = undefined;
  public user_lc: any = undefined;
  public config_global: any = {};
  public op_cart = false;
  public carrito_arr: Array<any> = [];
  public url;
  public subtotal = 0;
  public socket = io('http://localhost:4201');
  constructor(
    private _clienteService: ClienteService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id = localStorage.getItem('_id');
    this._clienteService.obtener_config_public().subscribe(
      (res) => {
        this.config_global = res.data;
      },
      (err) => {}
    );

    if (this.token) {
      this._clienteService.obtener_cliente_guest(this.id, this.token).subscribe(
        (res) => {
          this.user = res.data;
          localStorage.setItem('user_data', JSON.stringify(this.user));
          if (localStorage.getItem('user_data')) {
            this.user_lc = JSON.parse(localStorage.getItem('user_data') || '');
            this.obtener_carrito();
          } else {
            this.user_lc = undefined;
          }
        },
        (err) => {
          this.user = undefined;
        }
      );
    }
  }

  obtener_carrito() {
    this._clienteService
      .obtener_carrito_cliente(this.user_lc._id, this.token)
      .subscribe(
        (res) => {
          this.carrito_arr = res.data;
          this.subtotal = 0;
          this.calcular_carrito();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  ngOnInit(): any {
    this.socket.on('new-carrito', this.obtener_carrito.bind(this)); //eliminar
    this.socket.on('new-carrito-add', this.obtener_carrito.bind(this)); //Agregar
  }

  logout() {
    window.location.reload();
    localStorage.clear();
    this._router.navigate(['/login']);
  }

  op_modalcart() {
    if (!this.op_cart) {
      this.op_cart = true;
      $('#cart').addClass('show');
    } else {
      this.op_cart = false;
      $('#cart').removeClass('show');
    }
  }
  calcular_carrito() {
    this.carrito_arr.forEach((e) => {
      this.subtotal = this.subtotal + parseInt(e.producto.precio);
    });
  }
  eliminar_item(id: any) {
    this._clienteService.eliminar_carrito_cliente(id, this.token).subscribe(
      (res) => {
        iziToast.show({
          title: 'SUCCESS',
          class: 'text-success',
          titleColor: '#1DC74C',
          position: 'topRight',
          message: 'Se elimino el producto correctamente.',
        });
        this.socket.emit('delete-carrito', { data: res.data });
        console.log(res);
      },
      (err) => {}
    );
  }
}
