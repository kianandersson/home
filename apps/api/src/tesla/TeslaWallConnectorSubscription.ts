import { EventEmitter } from "../EventEmitter.ts";
import { TeslaWallConnector } from "./TeslaWallConnector.ts";
import { TeslaWallConnectorState } from "./TeslaWallConnectorState.ts";

export class TeslaWallConnectorSubscription {
  readonly #connectEventEmitter = new EventEmitter<this>(this);
  readonly #disconnectEventEmitter = new EventEmitter<this>(this);

  private state?: TeslaWallConnectorState;
  private controller?: AbortController;

  public get onConnect() {
    return this.#connectEventEmitter.subscribable;
  }

  public get onDisconnect() {
    return this.#disconnectEventEmitter.subscribable;
  }

  public constructor(
    public readonly wallConnector: TeslaWallConnector,
    public readonly interval: number
  ) {
    const emitters = [this.#connectEventEmitter, this.#disconnectEventEmitter];

    emitters.forEach((emitter) => {
      emitter.onSubscribe(() => this.subscribe());

      emitter.onUnsubscribe(() => {
        if (emitters.some((emitter) => emitter.listeners.size > 0)) return;

        this.unsubscribe();
      });
    });
  }

  private subscribe() {
    if (this.controller) return;

    this.controller = new AbortController();

    const {
      controller: { signal },
      interval,
    } = this;

    (async () => {
      try {
        const watcher = this.wallConnector.state.watch({
          interval,
          signal,
        });

        for await (const state of watcher) {
          if (!this.state) {
            this.state = state;
            continue;
          }

          if (!this.state.connected && state.connected)
            this.#connectEventEmitter.emit();

          if (this.state.connected && !state.connected)
            this.#disconnectEventEmitter.emit();

          this.state = state;
        }
      } finally {
        this.state = undefined;
        this.controller = undefined;
      }
    })();
  }

  private unsubscribe() {
    if (!this.controller) return;

    this.controller.abort();
  }
}
