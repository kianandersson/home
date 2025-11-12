import { EventEmitter } from "../EventEmitter.ts";
import { FroniusSymoInverterPowerState } from "./FroniusSymoInverterPowerState.ts";
import { FroniusSymoInverterPowerStateResolver } from "./FroniusSymoInverterPowerStateResolver.ts";

export class FroniusSymoInverterSubscription {
  readonly #changeEventEmitter = new EventEmitter<
    this,
    [state: FroniusSymoInverterPowerState]
  >(this);

  private state?: FroniusSymoInverterPowerState;
  private controller?: AbortController;

  public get onChange() {
    return this.#changeEventEmitter.subscribable;
  }

  public constructor(
    public readonly resolver: FroniusSymoInverterPowerStateResolver,
    public readonly interval: number
  ) {
    const emitters = [this.#changeEventEmitter];

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
        const watcher = this.resolver.watch({ interval, signal });

        for await (const next of watcher) {
          const current = this.state;

          this.state = next;

          if (!current) continue;

          this.#changeEventEmitter.emit(next);
        }
      } finally {
        this.unsubscribe();
      }
    })();
  }

  private unsubscribe() {
    this.controller?.abort();

    this.state = undefined;
    this.controller = undefined;
  }
}
