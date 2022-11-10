import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
declare var iziToast: any;

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  public idCliente;
  public token;
  public carrito_arr: Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar = 0;
  public socket = io('http://localhost:4201');

  constructor(private _clienteService: ClienteService) {
    this.url = GLOBAL.url;
    this.idCliente = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    this._clienteService
      .obtener_carrito_cliente(this.idCliente, this.token)
      .subscribe(
        (res) => {
          this.carrito_arr = res.data;
          this.calcular_carrito();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  ngOnInit(): void {}
  calcular_carrito() {
    this.carrito_arr.forEach((e) => {
      this.subtotal = this.subtotal + parseInt(e.producto.precio);
    });
    this.total_pagar = this.subtotal;
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
        this._clienteService
          .obtener_carrito_cliente(this.idCliente, this.token)
          .subscribe(
            (res) => {
              this.carrito_arr = res.data;
              this.calcular_carrito();
            },
            (err) => {
              console.log(err);
            }
          );
      },
      (err) => {}
    );
  }
}
