import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Settings} from '../game/game.service';
import {CommonModule, NgIf} from '@angular/common';
import {GameControlService} from '../game/game-control.service';
import {delay} from 'rxjs';
import {MatCard, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-settings-form',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatCard,
    MatCardTitle,
    MatDivider,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './settings-form.component.html',
  standalone: true,
  styleUrl: './settings-form.component.scss'
})
export class SettingsFormComponent implements OnInit {
  private  formBuilder = inject(FormBuilder);
  private gameControl = inject(GameControlService);

  settingsForm: FormGroup = this.formBuilder.group({
    fallingSpeed: new FormControl(2, [Validators.required, Validators.min(1)]),
    fallingFrequency: [1000, [Validators.required, Validators.min(100)]],
    playerSpeed: [10, [Validators.required, Validators.min(1)]],
    gameTime: [30, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    // Sync all changes live
    this.settingsForm.valueChanges.subscribe(values => {
      if (!this.settingsForm.valid) return;
      this.gameControl.updateSettings(values);
    });

    this.settingsForm.get('gameTime')?.valueChanges.pipe(delay(500)).subscribe(() => {
      if (!this.settingsForm.valid) return;
      this.gameControl.restartGame();
    });
  }

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
