import z from "zod";
import { TeslaVehicle } from "./TeslaVehicle.ts";

export class TeslaVehicleController {
  public constructor(
    private readonly binaryPath: string,
    private readonly publicKeyPath: string,
    private readonly privateKeyPath: string
  ) {}

  public async authorize(vehicle: TeslaVehicle) {
    const { publicKeyPath } = this;

    await this.exec(vehicle, [
      "add-key-request",
      publicKeyPath,
      "owner",
      "cloud_key",
    ]);
  }

  public async unlock(vehicle: TeslaVehicle) {
    const { privateKeyPath } = this;

    await this.exec(vehicle, ["--key-file", privateKeyPath, "unlock"]);
  }

  public async lock(vehicle: TeslaVehicle) {
    const { privateKeyPath } = this;

    await this.exec(vehicle, ["--key-file", privateKeyPath, "lock"]);
  }

  public async state(vehicle: TeslaVehicle) {
    const { privateKeyPath } = this;

    const process = await this.exec(vehicle, [
      "--key-file",
      privateKeyPath,
      "state",
      "charge",
    ]);

    const { stdout } = await process.output();

    try {
      const decoded = new TextDecoder().decode(stdout);

      return z.object({}).loose().parse(JSON.parse(decoded));
    } catch (error) {
      throw new Error("Failed to decode vehicle state output", {
        cause: error,
      });
    }
  }

  private async exec(vehicle: TeslaVehicle, args: string[]) {
    const { binaryPath } = this;
    const { vin } = vehicle;

    const process = new Deno.Command(binaryPath, {
      args: ["-ble", "-vin", vin, ...args],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const { success } = await process.status;

    if (!success) throw new Error("Failed to execute vehicle command");

    return process;
  }
}
