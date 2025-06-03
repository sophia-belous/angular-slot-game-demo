import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, interval, Subject, Subscription} from 'rxjs';

export interface Settings {
  // how fast objects drop
  fallingSpeed: number;
  // how often new objects appear
  fallingFrequency: number;
  // how fast the player can move left/right
  playerSpeed: number;
  // how long the session lasts
  gameTime: number;
  // width of the board
  containerWidth: number;
  // height of the board
  containerHeight: number;
  // player width
  playerWidth: number;
  // player height
  playerHeight: number;
  // falling object size;
  objectSize: number;
}

export interface GameObject {
  id: number;
  x: number;
  y: number;
}

export interface GameState {
  // current player position
  playerX: number;
  // list of falling objects
  fallingObjects: GameObject[];
  // player score
  score: number;
  // time left
  timeLeft: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private _settings: Settings = {
    fallingSpeed: 2,
    fallingFrequency: 1000,
    playerSpeed: 10,
    gameTime: 30,
    containerWidth: 300,
    containerHeight: 500,
    playerWidth: 50,
    playerHeight: 20,
    objectSize: 20
  };

  get settings() {
    return this._settings;
  }

  private _timerSub: Subscription | null = null;
  private _timeLeft = 0;
  private _nextObjectId = 0;
  private _animationFrameId: number | null = null;

  private _gameState$ = new BehaviorSubject<GameState>({
    playerX: 150,
    fallingObjects: [],
    score: 0,
    timeLeft: 0})

  gameState$ = this._gameState$.asObservable();

  gameOver$ = new Subject<void>(); // emits when the game ends

  updateSettings(newSettings: Partial<Settings>) {
    this._settings = { ...this._settings, ...newSettings };
  }

  movePlayer(direction: number) {
    const currentState = this._gameState$.getValue();
    // From current X position player moves left/right (-1/1)
    // with the speed set to how many pixels to move per step.
    const targetX = currentState.playerX + direction * this._settings.playerSpeed;
    // Min/Max is set to prevent the player moving past the left/right edge.
    const maxX = this._settings.containerWidth - this._settings.playerWidth;
    const newX = Math.max(0, Math.min(maxX, targetX));

    this._gameState$.next({ ...currentState, playerX: newX });
  }

  initializeGameState() {
    const initialPlayerX = this._settings.containerWidth / 2 - this._settings.playerWidth / 2;
    this._nextObjectId = 0;

    const initialGameState = {
      playerX: initialPlayerX,
      fallingObjects: [],
      score: 0,
      timeLeft: this._settings.gameTime
    }

    this._gameState$.next(initialGameState);
  }

  spawnObject() {
    const gameObject: GameObject = {
      id: this._nextObjectId++,
      // it should be a random horizontal position limited to container width
      x: Math.random() * this._settings.containerWidth - this._settings.playerWidth,
      y: 0
    };

    const currentState = this._gameState$.getValue();
    this._gameState$.next({ ...currentState, fallingObjects: [...currentState.fallingObjects, gameObject] });
  }

  clearObjects() {
    const state = this._gameState$.getValue();
    this._gameState$.next({
      ...state,
      fallingObjects: [],
    });
  }

  startGameLoop() {
    const loop = () => {
      const currentState = this._gameState$.getValue();
      const updatedFallingObjects = currentState.fallingObjects.map(obj => (
        {...obj, y: obj.y + this._settings.fallingSpeed}
      ));
      const maxY = this._settings.containerHeight - this._settings.playerHeight;
      const caughtFallingObjects = updatedFallingObjects.filter(
        // checks if the falling object y is close to the player and horizontal distance is less than width of the player
        obj => {
          const playerLeft = currentState.playerX;
          const playerRight = currentState.playerX + this._settings.playerWidth;
          const objectLeft = obj.x;
          const objectRight = obj.x + this._settings.objectSize;


          const horizontalOverlap = playerLeft < objectRight && playerRight > objectLeft;
          const verticalOverlap = obj.y >= maxY;

          return horizontalOverlap && verticalOverlap;
        }
      );

      const caughtIds = new Set(caughtFallingObjects.map(obj => obj.id));

      const remainingFallingObjects = updatedFallingObjects.filter(
        obj => obj.y <= this._settings.containerHeight && !caughtIds.has(obj.id)
      );

      this._gameState$.next({
        ...currentState,
        fallingObjects: remainingFallingObjects,
        score: currentState.score + caughtFallingObjects.length,
      })

      this._animationFrameId = requestAnimationFrame(loop)
    };

    this._animationFrameId = requestAnimationFrame(loop);
  }

  stopGameLoop() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  startTimer() {
    if (this._timerSub) {
      this._timerSub.unsubscribe();
    }
    const currentState = this._gameState$.getValue();
    this._timeLeft = currentState.timeLeft;
    this._timerSub = interval(1000).subscribe(() => {
      this._timeLeft--;
      const currentState = this._gameState$.getValue();
      this._gameState$.next({ ...currentState, timeLeft: this._timeLeft });
      if (this._timeLeft <= 0) {
        if (this._timerSub) this._timerSub.unsubscribe();
        this.gameOver$.next();
      }
    });
  }

  stopTimer() {
    this._timeLeft = 0;
    const currentState = this._gameState$.getValue();
    this._gameState$.next({ ...currentState, timeLeft: this._timeLeft });
    if (this._timerSub) {
      this._timerSub.unsubscribe();
      this._timerSub = null;
    }
  }

  ngOnDestroy() {
    this.gameOver$.complete();
  }
}
