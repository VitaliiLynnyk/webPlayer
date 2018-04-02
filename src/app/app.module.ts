import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


import { GetMusicService } from './services/get-music.service';
import { AuthService } from './services/auth.service';


import { AppComponent } from './app.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { UserSettingsComponent } from './pages/user/user-settings/user-settings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import {UserModule} from "./pages/user/user.module";
import { HeaderComponent } from './widgets/header/header.component';
import { FooterComponent } from './widgets/footer/footer.component';
import { PlayerComponent } from './widgets/player/player.component';

const appRoutes: Routes = [
  { path: 'signUp', component: RegistrationComponent },
  { path: 'signIn', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: 'user', component: UserComponent },
  { path: '',   redirectTo: '/signIn', pathMatch: 'full' },
  { path: 'user-settings', component: UserSettingsComponent },
  { path: '**', component: NotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    HomeComponent,
    UserComponent,
    UserSettingsComponent,
    NotFoundComponent,
    HeaderComponent,
    FooterComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule
  ],
  providers: [ GetMusicService, AuthService, UserModule ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
