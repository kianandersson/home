#!/usr/bin/env -S deno run --unstable --allow-run --allow-read

import { parse } from "https://deno.land/std@0.203.0/flags/mod.ts";
import { load } from "jsr:@std/dotenv";
import {
  TeslaVehicle,
  TeslaVehicleController,
  TeslaWallConnector,
} from "./src/index.ts";

const env = await load({
  envPath: ".env",
  export: true,
});

async function run() {
  const args = parse(Deno.args);

  const {
    _: [cmd],
  } = args;

  const binaryPath = "./tesla-control";

  const keyDir = "./keys";
  const publicKeyPath = `${keyDir}/public.pem`;
  const privateKeyPath = `${keyDir}/private.pem`;

  const controller = new TeslaVehicleController(
    binaryPath,
    publicKeyPath,
    privateKeyPath
  );

  const { TESLA_VEHICLE_VIN: vehicleVin } = env;

  const vehicle = new TeslaVehicle(controller, vehicleVin);

  const { TESLA_WALL_CONNECTOR_HOST: wallConnectorHost } = env;

  const wallConnectorUrl = new URL(`http://${wallConnectorHost}`);
  const wallConnector = new TeslaWallConnector(wallConnectorUrl);

  switch (cmd) {
    case "authorize":
      await vehicle.authorize();
      break;
    case "unlock":
      await vehicle.unlock();
      break;
    case "lock":
      await vehicle.lock();
      break;
    case "state":
      console.log(await vehicle.state());
      break;
    case "watch": {
      const { onConnect, onDisconnect } = wallConnector.subscribe({
        interval: 1000,
      });

      const subscriptions = [
        onConnect(() => console.log("connected")),
        onDisconnect(() => console.log("disconnected")),
      ];

      setTimeout(() => {
        subscriptions.forEach(({ unsubscribe }) => unsubscribe());
      }, 10000);
      break;
    }
  }
}

if (import.meta.main) run();
