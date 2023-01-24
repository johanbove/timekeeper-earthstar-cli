import { Earthstar } from "../deps.ts";
import { NAMESPACE } from "../constants.ts";

const serverUrl = Deno.args[0];

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

const result = settings.addServer(serverUrl);

if (Earthstar.isErr(result)) {
  console.error(result.message);
  Deno.exit(1);
}

console.log(`Added ${serverUrl} to known servers.`);

Deno.exit(0);
