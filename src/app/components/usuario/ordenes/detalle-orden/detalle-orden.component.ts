import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StarRatingComponent } from 'ng-starrating';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var noUiSlider: any;
declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-detalle-orden',
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css'],
})
export class DetalleOrdenComponent implements OnInit {
  public url;
  public token;
  public orden: any = {};
  public detalles: Array<any> = [];
  public load_data = true;
  public id: any;
  public review: any = {};
  public totalstar = 5;

  constructor(
    private _clienteService: ClienteService,
    private _route: ActivatedRoute
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._route.params.subscribe((params) => {
      this.id = params['id'];
    });
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this._clienteService
      .obtener_detalles_ordenes_cliente(this.id, this.token)
      .subscribe((response) => {
        if (response.data != undefined) {
          this.orden = response.data;
          response.detalles.forEach(
            (element: { estado: boolean; producto: { _id: any } }) => {
              this._clienteService
                .obtener_review_producto_cliente(element.producto._id)
                .subscribe((response) => {
                  let emitido = false;
                  response.data.forEach(
                    (element_: { cliente: string | any }) => {
                      if (element_.cliente == localStorage.getItem('_id')) {
                        emitido = true;
                      }
                    }
                  );
                  element.estado = emitido;
                });
            }
          );
          this.detalles = response.detalles;
          this.load_data = false;
        } else {
          this.orden = undefined;
        }
        console.log(this.detalles);
      });
  }

  openModal(item: any) {
    this.review = {};
    this.review.producto = item.producto._id;
    this.review.cliente = item.cliente;
    this.review.venta = this.id;
    console.log(item);
  }

  onRate($event: {
    oldValue: number;
    newValue: number;
    starRating: StarRatingComponent;
  }) {
    console.log($event.newValue);
  }
  emitir(id: any) {
    if (this.review.review) {
      if (this.totalstar && this.totalstar >= 0) {
        this.review.estrellas = this.totalstar;

        this._clienteService
          .emetir_review_producto_cliente(this.review, this.token)
          .subscribe((res) => {
            iziToast.show({
              title: 'SUCCESS',
              class: 'text-success',
              titleColor: '#1DC74C',
              position: 'topRight',
              message: 'Se emitio correctamente la reseña.',
            });
            $('#review-' + id).modal('hide');
            $('.modal-backdrop').removeClass('show');
            this.init_data();
          });
      } else {
        iziToast.show({
          title: 'ERROR',
          class: 'text-danger',
          titleColor: '#ff0000',
          position: 'topRight',
          message: 'Seleccione el numero de estrellas.',
        });
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        class: 'text-danger',
        titleColor: '#ff0000',
        position: 'topRight',
        message: 'Ingrese un mensaje de la reseña.',
      });
    }
  }
}
