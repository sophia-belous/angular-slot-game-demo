import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket$: WebSocketSubject<any>;
  public messages$ = new Subject<any>();

  constructor() {
    this.socket$ = webSocket({ url: 'wss://ws.postman-echo.com/raw', // public echo test
      deserializer: msg => msg });
    this.socket$.subscribe({
      next: (msg) => {
        console.log('WebSocket replied:', msg);
        this.messages$.next(JSON.parse(msg.data))
      },
      error: (err) => console.error('WebSocket error:', err),
    });
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  close() {
    this.socket$.complete();
  }

  ngOnDestroy() {
    this.socket$.complete();
  }
}
