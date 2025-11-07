import { TeslaWallConnectorStateResolver } from "./TeslaWallConnectorStateResolver.ts";
import { TeslaWallConnectorSubscription } from "./TeslaWallConnectorSubscription.ts";

export type TeslaWallConnectorSubscrioptionOptions = {
  interval: number;
};

export class TeslaWallConnector {
  public readonly state = new TeslaWallConnectorStateResolver(this);

  public constructor(public readonly url: URL) {}

  public subscribe({ interval }: TeslaWallConnectorSubscrioptionOptions) {
    return new TeslaWallConnectorSubscription(this, interval);
  }
}
