import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public user: any = {};
  public usuario: any = {};
  public token;

  constructor(
    private _clienteService: ClienteService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this._router.navigate(['/']);
    }
  }

  ngOnInit(): void {}

  login(loginForm: any) {
    if (loginForm.valid) {
      let data = {
        email: this.user.email,
        password: this.user.password,
      };
      this._clienteService.login_cliente(data).subscribe(
        (res) => {
          if (res.data == undefined) {
            iziToast.show({
              title: 'ERROR',
              class: 'text-danger',
              titleColor: '#ff0000',
              position: 'topRight',
              message: res.message,
            });
          } else {
            this.usuario = res.data;
            localStorage.setItem('token', res.token);
            localStorage.setItem('_id', res.data._id);

            this._router.navigate(['/']);
          }
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
