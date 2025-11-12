export type FroniusSymoInverterPowerStateProperties = {
  load: number;
  produktion: number;
  grid: number;
  battery: number;
};

export class FroniusSymoInverterPowerState {
  public constructor(
    public readonly properties: FroniusSymoInverterPowerStateProperties
  ) {}

  public get hash() {
    return JSON.stringify(this.properties);
  }

  public get load() {
    return this.properties.load;
  }

  public get produktion() {
    return this.properties.produktion;
  }

  public get grid() {
    return this.properties.grid;
  }

  public get battery() {
    return this.properties.battery;
  }
}
