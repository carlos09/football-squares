import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameGridComponent } from './game-grid/game-grid.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SquarePickComponent } from './dialog/square-pick/square-pick.component';

@NgModule({
  declarations: [
    AppComponent,
    GameGridComponent,
    SquarePickComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
