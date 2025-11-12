export type Listener<This, Args extends unknown[]> = (
  this: This,
  ...args: Args
) => void | Promise<void>;

export interface Subscription {
  unsubscribe(): void;
}

export interface Subscribable<This, Args extends unknown[] = []>
  extends AsyncIterable<Args> {
  (listener: Listener<This, Args>): Subscription;
  once(): Promise<Args>;
  asyncIterator(): AsyncIterator<Args>;
}

export type SubscribeFunction<This, Args extends unknown[]> = (
  listener: Listener<This, Args>
) => void;

export type UnsubscribeFunction<This, Args extends unknown[]> = (
  listener: Listener<This, Args>
) => void;

export interface SubscribableOptions<This, Args extends unknown[]> {
  subscribe: SubscribeFunction<This, Args>;
  unsubscribe: UnsubscribeFunction<This, Args>;
}

export function createSubscribable<This, Args extends unknown[] = []>({
  subscribe,
  unsubscribe,
}: SubscribableOptions<This, Args>): Subscribable<This, Args> {
  const subscribable: Subscribable<This, Args> = Object.assign(
    (listener: Listener<This, Args>) => {
      subscribe(listener);
      return {
        unsubscribe: () => {
          unsubscribe(listener);
        },
      };
    },
    {
      once: () =>
        new Promise<Args>((resolve) => {
          const listener = (...args: Args) => {
            unsubscribe(listener);
            resolve(args);
          };

          subscribe(listener);
        }),
      asyncIterator: () =>
        createSubscribableIterator<Args>(subscribe, unsubscribe),
      [Symbol.asyncIterator]: () =>
        createSubscribableIterator<Args>(subscribe, unsubscribe),
    }
  );

  return subscribable;
}

function createSubscribableIterator<Args extends unknown[]>(
  subscribe: SubscribeFunction<unknown, Args>,
  unsubscribe: UnsubscribeFunction<unknown, Args>
): AsyncIterableIterator<Args> {
  const queue: Args[] = [];

  let current: ((v: IteratorResult<Args>) => void) | null = null;

  const listener = (...value: Args) => {
    if (!current) {
      queue.push(value);
      return;
    }

    current({ value, done: false });
    current = null;
  };

  subscribe(listener);

  return {
    next() {
      if (queue.length) {
        const result = queue.shift();

        if (!result)
          return Promise.reject("Failed to resolve next iterator item");

        return Promise.resolve({ value: result, done: false });
      } else {
        return new Promise<IteratorResult<Args>>((resolve) => {
          current = resolve;
        });
      }
    },

    return(value?: unknown) {
      unsubscribe(listener);

      return Promise.resolve({ value, done: true });
    },

    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
