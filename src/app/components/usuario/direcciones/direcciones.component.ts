import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';
declare var iziToast: any;
declare var $: any;

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css'],
})
export class DireccionesComponent implements OnInit {
  public token;
  public direccion: any = {
    pais: '',
    region: '',
    provincia: '',
    principal: false,
  };
  public direcciones: Array<any> = [];

  public regiones: Array<any> = [];
  public provincias: Array<any> = [];
  public distritos: Array<any> = [];

  public regiones_arr: Array<any> = [];
  public provincias_arr: Array<any> = [];
  public distritos_arr: Array<any> = [];
  public load_data = true;
  constructor(
    private _guestService: GuestService,
    private _clienteService: ClienteService
  ) {
    this.token = localStorage.getItem('token');

    this._guestService.get_Regiones().subscribe((res) => {
      this.regiones_arr = res;
    });
    this._guestService.get_Proviencia().subscribe((res) => {
      this.provincias_arr = res;
    });
  }

  ngOnInit(): void {
    this.obtener_direccion();
  }

  obtener_direccion() {
    this._clienteService
      .obtener_direccion_todos_cliente(localStorage.getItem('_id'), this.token)
      .subscribe((res) => {
        this.direcciones = res.data;
        this.load_data = false;
      });
  }

  select_pais() {
    if (this.direccion.pais == 'México') {
      $('#sl-region').prop('disabled', false);
      this._guestService.get_Regiones().subscribe((res) => {
        console.log(res);
        res.forEach((element: { id: any; name: any }) => {
          this.regiones.push({
            id: element.id,
            name: element.name,
          });
        });
      });
    } else {
      $('#sl-region').prop('disabled', true);
      $('#sl-provincia').prop('disabled', true);
      this.regiones = [];
      this.provincias = [];
      this.direccion.region = '';
      this.direccion.provincia = '';
    }
  }
  select_region() {
    this.provincias = [];
    $('#sl-provincia').prop('disabled', false);
    this._guestService.get_Proviencia().subscribe((res) => {
      res.forEach((element: { department_id: any }) => {
        if (element.department_id == this.direccion.region) {
          this.provincias.push(element);
        }
      });
      console.log(this.provincias);
    });
  }
  registrar(registroForm: any) {
    if (registroForm.valid) {
      this.regiones_arr.forEach((e) => {
        if (parseInt(e.id) == parseInt(this.direccion.region)) {
          this.direccion.region = e.name;
        }
      });
      this.provincias_arr.forEach((e) => {
        if (parseInt(e.id) == parseInt(this.direccion.provincia)) {
          this.direccion.provincia = e.name;
        }
      });

      let data = {
        destinatario: this.direccion.destinatario,
        zip: this.direccion.zip,
        direccion: this.direccion.direccion,
        telefono: this.direccion.telefono,
        pais: this.direccion.pais,
        region: this.direccion.region,
        provincia: this.direccion.provincia,
        principal: this.direccion.principal,
        cliente: localStorage.getItem('_id'),
      };

      this._clienteService
        .registro_direccion_cliente(data, this.token)
        .subscribe((res) => {
          this.direccion = {
            pais: '',
            region: '',
            provincia: '',
            principal: false,
          };
          $('#sl-region').prop('disabled', false);
          $('#sl-privincia').prop('disabled', false);
          $('#sl-distrito').prop('disabled', false);
          iziToast.show({
            title: 'SUCCESS',
            class: 'text-success',
            titleColor: '#1DC74C',
            position: 'topRight',
            message: 'Se agregó la nueva dirección correctamente.',
          });
          this.obtener_direccion();
        });

      console.log(data);
    } else {
      iziToast.show({
        title: 'ERROR',
        class: 'text-danger',
        titleColor: '#ff0000',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos.',
      });
    }
  }
  establecer_principal(id: any) {
    this._clienteService
      .cambiar_direccion_principal_cliente(
        id,
        localStorage.getItem('_id'),
        this.token
      )
      .subscribe((res) => {
        iziToast.show({
          title: 'SUCCESS',
          class: 'text-success',
          titleColor: '#1DC74C',
          position: 'topRight',
          message: 'Se actualizó la dirección principal.',
        });
        this.obtener_direccion();
      });
  }
}
