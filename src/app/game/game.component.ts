import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GameService} from './game.service';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {debounceTime, filter, fromEvent, map, Subject, takeUntil} from 'rxjs';
import {GameControlService} from './game-control.service';

@Component({
  selector: 'app-game',
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './game.component.html',
  standalone: true,
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {

  @ViewChild('gameContainer', { static: true }) containerRef!: ElementRef;

  private destroy$ = new Subject<void>();
  private gameService = inject(GameService);
  private gameControl = inject(GameControlService);
  gameState$ = this.gameService.gameState$;
  gameSettings = this.gameService.settings;

  isGameOver$ = this.gameState$.pipe(map(state => state.timeLeft === 0));
  gamePlayedOnce$ = this.gameControl.gamePlayedOnce$;

  ngOnInit() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(() => this.gameControl.isGameRunning()),
        filter(event => event.key === 'ArrowLeft' || event.key === 'ArrowRight'),
        map(event => event.key === 'ArrowLeft' ? -1 : 1),
        takeUntil(this.destroy$)
      )
      .subscribe((position: number) => this.gameService.movePlayer(position))
  }

  startGame() {
    this.gameControl.restartGame();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.gameControl.stopGame();
  }

}
