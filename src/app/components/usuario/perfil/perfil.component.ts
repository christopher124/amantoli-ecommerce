import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast: any;
declare var $: any;
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  public cliente: any = {};
  public id;
  public token;
  constructor(private _clienteService: ClienteService) {
    this.id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    if (this.id) {
      this._clienteService.obtener_cliente_guest(this.id, this.token).subscribe(
        (res) => {
          this.cliente = res.data;
        },
        (err) => {}
      );
    }
  }

  ngOnInit(): void {}

  actualizar(actualizarForm: any) {
    if (actualizarForm.valid) {
      this.cliente.password = $('#input_password').val();
      this._clienteService
        .actualizar_perfil_cliente_guest(this.id, this.cliente, this.token)
        .subscribe(
          (res) => {
            iziToast.show({
              title: 'SUCCESS',
              class: 'text-success',
              titleColor: '#1DC74C',
              position: 'topRight',
              message: 'S actualizo su perfil correctamente.',
            });
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      iziToast.show({
        title: 'ERROR',
        class: 'text-danger',
        titleColor: '#ff0000',
        position: 'topRight',
        message: 'Los datos del formulario no son validos.',
      });
    }
  }
}
