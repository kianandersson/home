import { FroniusSymoInverterPowerStateResolver } from "./FroniusSymoInverterPowerStateResolver.ts";

export class FroniusSymoInverter {
  public readonly powerState = new FroniusSymoInverterPowerStateResolver(this);

  public constructor(public readonly url: URL) {}
}
