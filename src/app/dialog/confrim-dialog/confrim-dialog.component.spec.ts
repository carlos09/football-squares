import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfrimDialogComponent } from './confrim-dialog.component';

describe('ConfrimDialogComponent', () => {
  let component: ConfrimDialogComponent;
  let fixture: ComponentFixture<ConfrimDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfrimDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfrimDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
