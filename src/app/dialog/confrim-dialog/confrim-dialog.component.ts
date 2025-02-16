import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confrim-dialog',
  standalone: false,
  templateUrl: './confrim-dialog.component.html',
  styleUrl: './confrim-dialog.component.scss'
})
export class ConfrimDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfrimDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
