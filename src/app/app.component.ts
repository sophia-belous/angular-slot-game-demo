import { Component } from '@angular/core';
import {SettingsFormComponent} from './settings-form/settings-form.component';
import {GameComponent} from './game/game.component';

@Component({
  selector: 'app-root',
  imports: [
    SettingsFormComponent,
    GameComponent
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'slot-mini-game';
}
