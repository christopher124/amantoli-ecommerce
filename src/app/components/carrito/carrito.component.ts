import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
import { GuestService } from 'src/app/services/guest.service';
import { Router } from '@angular/router';
declare var iziToast: any;
declare var Cleave: any;
declare var StickySidebar: any;
declare var paypal: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  @ViewChild('paypalButton', { static: true }) paypalElement: ElementRef | any;
  public idCliente;
  public token;
  public carrito_arr: Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar: any = 0;
  public socket = io('http://localhost:4201');
  public direccion_principal: any = {};
  public envios: Array<any> = [];
  public envio_precio = '0';
  public venta: any = {};
  public dventa: Array<any> = [];
  public carrito_load = true;
  public user: any = {};
  public error_cupon = '';
  public descuento = 0;
  public descuento_activo: any = undefined;

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.idCliente = localStorage.getItem('_id');
    this.venta.cliente = this.idCliente;
    this.token = localStorage.getItem('token');

    this._guestService.get_Envios().subscribe((res) => {
      this.envios = res;
    });
    this.user = JSON.parse(localStorage.getItem('user_data') || '');
  }

  ngOnInit(): void {
    this._guestService.obtener_descuento_activo().subscribe((res) => {
      this.descuento_activo = res.data[0];
      console.log(this.descuento_activo);
    });
    this.init_Data();
    setTimeout(() => {
      new Cleave('#cc-number', {
        creditCard: true,
        onCreditCardTypeChanged: function (type: any) {
          // update UI ...
        },
      });
      new Cleave('#cc-exp-date', {
        date: true,
        datePattern: ['m', 'y'],
      });
      new StickySidebar('.sidebar-sticky', { topSpacing: 20 });
    });
    this.get_direccion_principal();

    paypal
      .Buttons({
        style: {
          layout: 'horizontal',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: 'Pago de Amantoli',
                amount: {
                  currency_code: 'USD',
                  value: this.total_pagar,
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log(order);

          this.venta.transaccion =
            order.purchase_units[0].payments.captures[0].id;
          this.venta.detalles = this.dventa;
          this._clienteService
            .registro_compra_cliente(this.venta, this.token)
            .subscribe((res) => {
              this._clienteService
                .enviar_correo_compra_cliente(res.venta?._id, this.token)
                .subscribe((res) => {
                  iziToast.show({
                    title: 'SUCCESS',
                    class: 'text-success',
                    titleColor: '#1DC74C',
                    position: 'topRight',
                    message:
                      'Compra realizada con éxito, revisa tu correo electrónico registrado en la tienda.',
                  });
                  this._router.navigate(['/']);
                  console.log(res);
                });
            });
          console.log(this.venta._id);
        },
        onError: () => {},
        onCancel: function (data: any, actions: any) {},
      })
      .render(this.paypalElement.nativeElement);
  }

  init_Data() {
    this._clienteService
      .obtener_carrito_cliente(this.idCliente, this.token)
      .subscribe(
        (res) => {
          this.carrito_arr = res.data;
          this.carrito_arr.forEach((e) => {
            this.dventa.push({
              producto: e.producto._id,
              subtotal: e.producto.precio,
              variedad: e.variedad,
              cantidad: e.cantidad,
              cliente: localStorage.getItem('_id'),
            });
          });

          this.carrito_load = false;

          this.calcular_carrito();
          this.calcular_total('Envio Gratis');
        },
        (err) => {
          console.log(err);
        }
      );
  }

  get_direccion_principal() {
    this._clienteService
      .obtener_direccion_principal_cliente(
        localStorage.getItem('_id'),
        this.token
      )
      .subscribe((res) => {
        if (res.data == undefined) {
          this.direccion_principal = undefined;
        } else {
          this.direccion_principal = res.data;
          this.venta.direccion = this.direccion_principal._id;
        }
      });
  }

  calcular_carrito() {
    this.subtotal = 0;
    if (this.descuento_activo == undefined) {
      this.carrito_arr.forEach((e) => {
        let sub_precio = parseInt(e.producto.precio) * e.cantidad;
        this.subtotal = this.subtotal + sub_precio;
      });
    } else if (this.descuento_activo != undefined) {
      this.carrito_arr.forEach((e) => {
        let cantidad = e.cantidad;
        let sub_precio =
          Math.round(parseInt(e.producto.precio)) -
          (parseInt(e.producto.precio) * this.descuento_activo.descuento) / 100;
        let todo = sub_precio * cantidad;
        this.subtotal = this.subtotal + todo;
      });
    }
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
        this.init_Data();
      },
      (err) => {}
    );
  }

  calcular_total(envio_titulo: any) {
    this.total_pagar =
      parseInt(this.subtotal.toString()) + parseInt(this.envio_precio);
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.envio_precio);
    this.venta.envio_titulo = envio_titulo;

    console.log(this.venta);
  }

  validar_cupon() {
    if (this.venta.cupon) {
      if (this.venta.cupon.toString().length <= 25) {
        // si es valido
        this._clienteService
          .validar_cupon_cliente(this.venta.cupon, this.token)
          .subscribe((res) => {
            if (res.data != undefined) {
              //descuento
              this.error_cupon = '';

              if (res.data.tipo == 'Valor fijo') {
                this.descuento = res.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              } else if (res.data.tipo == 'Porcentaje') {
                this.descuento = (this.total_pagar * res.data.valor) / 100;
                this.total_pagar = this.total_pagar - this.descuento;
              }
            } else {
              this.error_cupon = 'El cupón no se pudo canjear.';
            }
            console.log(res);
          });
      } else {
        this.error_cupon = 'El cupón debe ser menos de 25 caracteres.';
        // no es valido
      }
    } else {
      this.error_cupon = 'El cupón no es válido.';
    }
  }
}
