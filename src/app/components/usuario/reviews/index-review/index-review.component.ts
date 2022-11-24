import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

@Component({
  selector: 'app-index-review',
  templateUrl: './index-review.component.html',
  styleUrls: ['./index-review.component.css'],
})
export class IndexReviewComponent implements OnInit {
  public load_data = true;
  public reviews: Array<any> = [];
  public token;
  public url;
  public id;

  public page = 1;
  public pageSize = 15;

  constructor(private _clienteService: ClienteService) {
    this.id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this._clienteService
      .obtener_reviews_cliente(this.id, this.token)
      .subscribe((res) => {
        this.reviews = res.data;
        console.log(res);
        this.load_data = false;
      });
  }
}
