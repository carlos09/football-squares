import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameGridComponent } from './game-grid/game-grid.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SquarePickComponent } from './dialog/square-pick/square-pick.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateUserDialogComponent } from './dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from './dialog/confrim-dialog/confrim-dialog.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { appReducer } from './store/app.state';
import { SelectionsEffects } from './store/selections/selections.effects';
import { StartGameEffects } from './store/start-game/start-game.effects';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    GameGridComponent,
    SquarePickComponent,
    CreateUserDialogComponent,
    ConfrimDialogComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Keeps last 25 states
      logOnly: environment.production // Restricts debugging in production
    }),
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot([SelectionsEffects, StartGameEffects]),    
    // SelectionsModule,
    // StartGameModule,
    // StoreDevtoolsModule.instrument({
    //   maxAge: 25, // Keeps last 25 states
    //   logOnly: environment.production // Restricts debugging in production
    // })
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
