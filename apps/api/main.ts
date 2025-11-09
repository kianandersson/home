#!/usr/bin/env -S deno run --unstable --allow-run --allow-read

import { Server } from "https://deno.land/std@0.166.0/http/server.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts";
import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts";
import { load } from "jsr:@std/dotenv";
import {
  TeslaVehicle,
  TeslaVehicleController,
  TeslaWallConnector,
  type Subscription,
} from "./src/index.ts";

console.log("NEW RELEASE!!!");

try {
  await load({ export: true });
} catch {
  // do nothing
}

function run() {
  const binaryPath = "tesla-control";

  const keyDir = "./keys";
  const publicKeyPath = `${keyDir}/public.pem`;
  const privateKeyPath = `${keyDir}/private.pem`;

  const controller = new TeslaVehicleController(
    binaryPath,
    publicKeyPath,
    privateKeyPath
  );

  const vehicleVin = Deno.env.get("TESLA_VEHICLE_VIN");

  if (!vehicleVin) throw new Error("A vehicle VIN has not been provided");

  const vehicle = new TeslaVehicle(controller, vehicleVin);

  const wallConnectorHost = Deno.env.get("TESLA_WALL_CONNECTOR_HOST");

  if (!wallConnectorHost)
    throw new Error("A wall connector host has not been provided");

  const wallConnectorUrl = new URL(`http://${wallConnectorHost}`);
  const wallConnector = new TeslaWallConnector(wallConnectorUrl);

  const { onConnect, onDisconnect } = wallConnector.subscribe({
    interval: 1000,
  });

  let subscriptions: Subscription[] | undefined;

  const typeDefs = gql`
    type Query {
      state: String
    }

    type Mutation {
      subscribe: Boolean
      unsubscribe: Boolean
    }
  `;

  const resolvers = {
    Query: {
      async state() {
        return JSON.stringify(await vehicle.state());
      },
    },
    Mutation: {
      subscribe() {
        if (subscriptions) return false;

        subscriptions = [
          onConnect(() => console.log("connected")),
          onDisconnect(() => console.log("disconnected")),
        ];

        return true;
      },
      unsubscribe() {
        if (!subscriptions) return false;

        subscriptions.forEach(({ unsubscribe }) => unsubscribe());
        subscriptions = undefined;

        return true;
      },
    },
  };

  const schema = makeExecutableSchema({ resolvers, typeDefs });

  const server = new Server({
    handler: async (request: Request) => {
      const { url } = request;
      const { pathname } = new URL(url);

      switch (pathname) {
        case "/graphql": {
          const { headers } = request;

          const host = headers.get("host");

          if (host !== "api.anderssonfischer.local")
            return new Response("Forbidden", { status: 403 });

          return await GraphQLHTTP({ schema })(request);
        }
        default:
          return new Response("Not Found", { status: 404 });
      }
    },
    port: 3000,
  });

  server.listenAndServe();
}

if (import.meta.main) run();
