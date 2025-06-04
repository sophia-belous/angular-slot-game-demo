import {inject, Injectable, OnDestroy} from '@angular/core';
import {GameService, Settings} from './game.service';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {WebsocketService} from '../websocket.service';

@Injectable({
  providedIn: 'root'
})
export class GameControlService implements OnDestroy {
  private isRunning = false;
  private _gamePlayedOnce$ = new BehaviorSubject<boolean>(false);
  gamePlayedOnce$ = this._gamePlayedOnce$.asObservable();
  private objectSpawnIntervalId: any = null;

  private gameService = inject(GameService);
  private webSocket = inject(WebsocketService);

  private destroy$ = new Subject<void>();

  constructor() {
    this.gameService.gameOver$
      .pipe(takeUntil(this.destroy$))
      .subscribe(score => {
        this.stopGame();

          this.webSocket.sendMessage({ event: 'gameOver', score });
      });
  }

  startGame() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._gamePlayedOnce$.next(true);
    this.gameService.initializeGameState();
    this.startSpawningObjects();
    this.gameService.startGameLoop();
  }

  stopGame() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.gameService.stopGameLoop();
    this.gameService.stopTimer();
    this.stopSpawningObjects();
    this.gameService.clearObjects();
  }

  updateSettings(newSettings: Partial<Settings>) {
    const restartSpawning = newSettings.fallingFrequency !== this.gameService.settings.fallingFrequency;

    this.gameService.updateSettings(newSettings);

    if (restartSpawning && this.isRunning) {
      this.startSpawningObjects(); // safely restart the interval
    }
  }


  private startSpawningObjects() {
    this.stopSpawningObjects(); // clear any previous interval
    this.objectSpawnIntervalId = setInterval(() => {
      this.gameService.spawnObject();
    }, this.gameService.settings.fallingFrequency);
  }

  private stopSpawningObjects() {
    if (this.objectSpawnIntervalId) {
      clearInterval(this.objectSpawnIntervalId);
      this.objectSpawnIntervalId = null;
    }
  }

  restartGame() {
    this.stopGame();
    this.startGame();
    this.gameService.startTimer();
  }

  isGameRunning() {
    return this.isRunning;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
