import { TeslaWallConnectorStateResolver } from "./TeslaWallConnectorStateResolver.ts";

export class TeslaWallConnector {
  public readonly state = new TeslaWallConnectorStateResolver(this);

  public constructor(public readonly url: URL) {}
}
