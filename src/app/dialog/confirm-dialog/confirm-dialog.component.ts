import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    standalone: false,
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
    @Input() title: string = 'Confirm Action';
    @Input() message: string = 'Are you sure?';
    @Output() confirmed = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    onConfirm(): void {
        this.confirmed.emit();
    }

    onCancel(): void {
        this.closed.emit();
    }
}
