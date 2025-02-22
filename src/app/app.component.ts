import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    standalone: false,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'football-squares';
    ngOnInit(): void {
        console.log('game home page');
    }
}
