import { z } from "zod";
import { delay } from "../delay.ts";
import { FroniusSymoInverter } from "./FroniusSymoInverter.ts";
import { FroniusSymoInverterPowerState } from "./FroniusSymoInverterPowerState.ts";
import { FroniusSymoInverterSubscription } from "./FroniusSymoInverterPowerSubscription.ts";

const froniusSymoInverterPowerFlowSchema = z.object({
  Body: z.object({
    Data: z.object({
      Site: z.object({
        P_Load: z.number(),
        P_PV: z.number(),
        P_Grid: z.number(),
        P_Akku: z.number(),
      }),
    }),
  }),
});

export type FroniusSymoInverterFetchStateOptions = {
  signal?: AbortSignal;
};

export type FroniusSymoInverterWatchStateOptions =
  FroniusSymoInverterFetchStateOptions & {
    interval: number;
  };

export type FroniusSymoInverterSubscrioptionOptions = {
  interval: number;
};

export class FroniusSymoInverterPowerStateResolver {
  public constructor(private readonly inverter: FroniusSymoInverter) {}

  public async get({
    signal,
  }: FroniusSymoInverterFetchStateOptions = {}): Promise<FroniusSymoInverterPowerState> {
    const response = await fetch(
      new URL("/solar_api/v1/GetPowerFlowRealtimeData.fcgi", this.inverter.url),
      { signal }
    );

    const {
      Body: {
        Data: {
          Site: {
            P_Load: load,
            P_PV: produktion,
            P_Grid: grid,
            P_Akku: battery,
          },
        },
      },
    } = froniusSymoInverterPowerFlowSchema.parse(await response.json());

    return new FroniusSymoInverterPowerState({
      load,
      produktion,
      grid,
      battery,
    });
  }

  public async *watch({
    signal,
    interval,
  }: FroniusSymoInverterWatchStateOptions) {
    let last: FroniusSymoInverterPowerState | undefined;

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

  public subscribe({ interval }: FroniusSymoInverterSubscrioptionOptions) {
    return new FroniusSymoInverterSubscription(this, interval);
  }
}
