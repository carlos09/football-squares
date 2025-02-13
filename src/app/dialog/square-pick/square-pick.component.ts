import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-square-pick',
  standalone: false,
  templateUrl: './square-pick.component.html',
  styleUrl: './square-pick.component.scss'
})
export class SquarePickComponent {
  constructor(public dialogRef: MatDialogRef<SquarePickComponent>) {}

  close() {
    this.dialogRef.close();
  }
}
