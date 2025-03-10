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
import { appEffects, appReducer } from './store/app.state';
import { environment } from '../environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GameComponent } from './game/game.component';
import { LandingComponent } from './landing/landing.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HeaderComponent } from './header/header.component';
import {
    LucideAngularModule,
    File,
    Home,
    Menu,
    UserCheck,
    CircleUserRound,
    UserRound,
    Loader,
    CircleHelp,
} from 'lucide-angular';
import { GameSettingsComponent } from './game-settings/game-settings.component';
import { CommonModule } from '@angular/common';
import { GameScoringComponent } from './game-scoring/game-scoring.component';
import { GamePlayersComponent } from './game-players/game-players.component';

@NgModule({
    declarations: [
        AppComponent,
        GameGridComponent,
        SquarePickComponent,
        CreateUserDialogComponent,
        ConfrimDialogComponent,
        GameComponent,
        LandingComponent,
        HeaderComponent,
        GameSettingsComponent,
        GameScoringComponent,
        GamePlayersComponent,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        FormsModule,
        MatSnackBarModule,
        StoreModule.forRoot(appReducer),
        EffectsModule.forRoot(appEffects),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production,
        }),
        LucideAngularModule.pick({
            File,
            Home,
            Menu,
            UserCheck,
            CircleUserRound,
            UserRound,
            Loader,
            CircleHelp,
        }),
    ],
    providers: [provideAnimationsAsync()],
    bootstrap: [AppComponent],
})
export class AppModule {}
