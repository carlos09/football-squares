import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    standalone: false,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'football-squares';
    isDarkMode = false;
    ngOnInit(): void {
        console.log('game home page');
        this.isDarkMode = localStorage.getItem('theme') === 'dark';
        this.updateTheme();
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        this.updateTheme();
    }

    updateTheme() {
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
