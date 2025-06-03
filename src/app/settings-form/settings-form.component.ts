import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Settings} from '../game/game.service';
import {NgIf} from '@angular/common';
import {GameControlService} from '../game/game-control.service';

@Component({
  selector: 'app-settings-form',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss'
})
export class SettingsFormComponent {
  private  formBuilder = inject(FormBuilder);
  private gameControl = inject(GameControlService);

  settingsForm: FormGroup = this.formBuilder.group({
    fallingSpeed: new FormControl(2, [Validators.required, Validators.min(1)]),
    fallingFrequency: [1000, [Validators.required, Validators.min(100)]],
    playerSpeed: [10, [Validators.required, Validators.min(1)]],
    gameTime: [30, [Validators.required, Validators.min(1)]],
  });

  applySettings() {
    this.gameControl.updateSettings(this.settingsForm.value as Settings);
  }

  startGame() {
    if (this.settingsForm.valid) {
      this.applySettings();
      this.gameControl.restartGame();
    }
  }

  stopGame() {
    this.gameControl.stopGame();
  }
}
