import { Power } from "../physics/index.ts";

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
    return new Power(this.properties.load);
  }

  public get produktion() {
    return new Power(this.properties.produktion);
  }

  public get grid() {
    return new Power(this.properties.grid);
  }

  public get battery() {
    return new Power(this.properties.battery);
  }
}
