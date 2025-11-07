export type TeslaWallConnectorStateProperties = {
  connected: boolean;
};

export class TeslaWallConnectorState {
  public constructor(
    public readonly properties: TeslaWallConnectorStateProperties
  ) {}

  public get hash() {
    return JSON.stringify(this.properties);
  }

  public get connected() {
    return this.properties.connected;
  }
}
