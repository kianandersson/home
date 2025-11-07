import { createSubscribable, type Listener } from "./Subscribable.ts";

export class EventEmitter<Parent, Args extends unknown[] = []> {
  #subscribeEventEmitter?: EventEmitter<this>;
  #unsubscribeEventEmitter?: EventEmitter<this>;

  public readonly listeners = new Set<Listener<Parent, Args>>();

  private get subscribeEventEmitter() {
    if (!this.#subscribeEventEmitter)
      this.#subscribeEventEmitter = new EventEmitter(this);

    return this.#subscribeEventEmitter;
  }

  private get unsubscribeEventEmitter() {
    if (!this.#unsubscribeEventEmitter)
      this.#unsubscribeEventEmitter = new EventEmitter(this);

    return this.#unsubscribeEventEmitter;
  }

  public get onSubscribe() {
    return this.subscribeEventEmitter.subscribable;
  }

  public get onUnsubscribe() {
    return this.unsubscribeEventEmitter.subscribable;
  }

  public get subscribable() {
    return createSubscribable<Parent, Args>({
      subscribe: this.subscribe.bind(this),
      unsubscribe: this.unsubscribe.bind(this),
    });
  }

  public constructor(private readonly parent: Parent) {}

  public subscribe(listener: Listener<Parent, Args>): void {
    this.listeners.add(listener);
    this.subscribeEventEmitter.emit();
  }

  public unsubscribe(listener: Listener<Parent, Args>): void {
    this.listeners.delete(listener);
    this.unsubscribeEventEmitter.emit();
  }

  public emit(...args: Args): void {
    for (const listener of this.listeners) {
      listener.apply(this.parent, args);
    }
  }
}
