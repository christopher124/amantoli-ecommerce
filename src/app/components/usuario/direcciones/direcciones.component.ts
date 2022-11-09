import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css'],
})
export class DireccionesComponent implements OnInit {
  public direccion: any = {
    pais: '',
    region: '',
    provincia: '',
  };

  constructor() {}

  ngOnInit(): void {}
}
