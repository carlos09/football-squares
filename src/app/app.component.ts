import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'football-squares';
  selectedCount = 0;

  updateSelectedCount(count: number) {
    this.selectedCount = count;
  }

  finishSelection() {
    alert(`You selected ${this.selectedCount} squares!`);
  }
}
