import { Component, OnInit } from '@angular/core';
import { GuestService } from 'src/app/services/guest.service';
declare var iziToast: any;

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css'],
})
export class ContactoComponent implements OnInit {
  public load_btn = false;
  public contacto: any = {};

  constructor(private _guestService: GuestService) {}

  ngOnInit(): void {}

  registro(registroForm: any) {
    if (registroForm.valid) {
      this.load_btn = true;
      this._guestService
        .enviar_mensaje_contacto(this.contacto)
        .subscribe((res) => {
          iziToast.show({
            title: 'SUCCESS',
            class: 'text-success',
            titleColor: '#1DC74C',
            position: 'topRight',
            message: 'Se envio el correctamente el mensaje.',
          });
          this.contacto = {};
          console.log(res);
          this.load_btn = false;
        });
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
