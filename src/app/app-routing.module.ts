import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { LandingComponent } from './landing/landing.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
    { path: '', component: LandingComponent },
    {
        path: 'game/:gameCode',
        component: GameComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
