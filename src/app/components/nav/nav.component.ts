import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';

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

  constructor(
    private _clienteService: ClienteService,
    private _router: Router
  ) {
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

  ngOnInit(): void {}

  logout() {
    window.location.reload();
    localStorage.clear();
    this._router.navigate(['/login']);
  }
}
