import { z } from "zod";
import { delay } from "../delay.ts";
import { TeslaWallConnector } from "./TeslaWallConnector.ts";
import { TeslaWallConnectorState } from "./TeslaWallConnectorState.ts";
import { TeslaWallConnectorSubscription } from "./TeslaWallConnectorSubscription.ts";

const teslaWallConnectorVitalsSchema = z.object({
  vehicle_connected: z.boolean(),
});

export type TeslaWallConnectorFetchStateOptions = {
  signal?: AbortSignal;
};

export type TeslaWallConnectorWatchStateOptions =
  TeslaWallConnectorFetchStateOptions & {
    interval: number;
  };

export type TeslaWallConnectorSubscrioptionOptions = {
  interval: number;
};

export class TeslaWallConnectorStateResolver {
  public constructor(private readonly wallConnector: TeslaWallConnector) {}

  public async get({
    signal,
  }: TeslaWallConnectorFetchStateOptions = {}): Promise<TeslaWallConnectorState> {
    const response = await fetch(
      new URL("/api/1/vitals", this.wallConnector.url),
      { signal }
    );

    const { vehicle_connected: connected } =
      teslaWallConnectorVitalsSchema.parse(await response.json());

    return new TeslaWallConnectorState({ connected });
  }

  public async *watch({
    signal,
    interval,
  }: TeslaWallConnectorWatchStateOptions) {
    let last: TeslaWallConnectorState | undefined;

    while (true) {
      if (signal?.aborted) return;

      const next = await this.get({ signal });

      if (next.hash !== last?.hash) {
        last = next;
        yield next;
      }

      try {
        await delay(interval, { signal });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        throw error;
      }
    }
  }

  public subscribe({ interval }: TeslaWallConnectorSubscrioptionOptions) {
    return new TeslaWallConnectorSubscription(this, interval);
  }
}
