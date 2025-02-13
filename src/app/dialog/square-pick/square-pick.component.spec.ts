import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquarePickComponent } from './square-pick.component';

describe('SquarePickComponent', () => {
  let component: SquarePickComponent;
  let fixture: ComponentFixture<SquarePickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SquarePickComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquarePickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
