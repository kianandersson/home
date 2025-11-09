import { TeslaVehicleController } from "./TeslaVehicleController.ts";

export class TeslaVehicle {
  public constructor(
    private readonly controller: TeslaVehicleController,
    public readonly vin: string
  ) {}

  public async authorize() {
    await this.controller.authorize(this);
  }

  public async wake() {
    await this.controller.wake(this);
  }

  public async unlock() {
    await this.controller.unlock(this);
  }

  public async lock() {
    await this.controller.lock(this);
  }

  public async state() {
    return await this.controller.state(this);
  }
}
