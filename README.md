# Angular Slot Game Demo

This project is a test assignment built using Angular. It’s a simple falling-object (slot-style) game where a player-controlled bar moves horizontally to catch falling items. The game was designed with best practices in component-level service structure, reactivity, and maintainability in mind.

## 🎮 Game Description
The player controls a block at the bottom of the screen using left and right arrow keys. Objects fall from the top at a configurable speed and interval. The player's goal is to catch as many objects as possible before the timer runs out.

## 🚀 Live Demo

Check out the live version here:  
[https://sophia-belous.github.io/angular-slot-game-demo/](https://sophia-belous.github.io/angular-slot-game-demo/)

## 📦 Running Locally

1. Clone the repository:
```bash
git clone https://github.com/sophia-belous/angular-slot-game-demo.git
cd angular-slot-game-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```
Then navigate to [http://localhost:4200](http://localhost:4200) in your browser.


---

## 🧱 Code Architecture

### `GameService`
- Core logic service that manages game state.
- Uses a `BehaviorSubject` to emit game state updates (player position, falling objects, score, time left).
- Handles movement, object spawning, scoring, and time countdown.

### `GameControlService`
- High-level controller that starts/stops the game.
- Responsible for coordination between UI and game logic.

### `SettingsForm`
- A reactive form in the UI that lets users configure:
  - Falling object speed
  - Falling frequency
  - Game duration
  - Player speed

### `GameComponent`
- Contains UI logic and reacts to service observables.
- Uses `fromEvent(document, 'keydown')` with filtering to allow player movement only when game is running.
- Subscribes to `gameOver$` to update UI.

### `WebSocketService`
- Uses `rxjs/webSocket` to establish a WebSocket connection.
- Sends a message to the server when the game ends (e.g., score submission).

---

## 🛠 Key Features
- 🎮 Keyboard-controlled movement using reactive streams
- 🧠 Clear separation of stateful and controlling logic
- 🧪 Fully testable and maintainable structure
- 🔁 Re-playable game loop and real-time updates
- 🎨 Configurable game via settings form
- 🔗 WebSocket integration to simulate real-time server interaction

## 🔍 Includes
- RxJS usage (Subjects, interval, fromEvent)
- Clean Angular architecture
- Component-provided service strategy
- WebSocket usage
- Deployment and CI/CD with GitHub Pages
