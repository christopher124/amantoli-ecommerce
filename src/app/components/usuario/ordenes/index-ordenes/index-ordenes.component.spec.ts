import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexOrdenesComponent } from './index-ordenes.component';

describe('IndexOrdenesComponent', () => {
  let component: IndexOrdenesComponent;
  let fixture: ComponentFixture<IndexOrdenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexOrdenesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexOrdenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
