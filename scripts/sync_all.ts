// Sync all known shares with all known servers.
import { Earthstar } from "../deps.ts";
import { NAMESPACE } from "../constants.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

const peer = new Earthstar.Peer();

for (const share of settings.shares) {
  const replica = new Earthstar.Replica({
    driver: new Earthstar.ReplicaDriverFs(
      share,
      `./share_data/${share}/`,
    ),
  });

  console.log(`Found share to sync with: ${share}`);

  peer.addReplica(replica);
}

const syncOps = settings.servers.map((serverUrl) => {
  const syncer = peer.sync(serverUrl);

  console.log(`Found server to sync with: ${serverUrl}`);
  // console.log(syncer);

  syncer.isDone().then(() => {
    console.log(`✅ Synced with ${serverUrl}`);
  }).catch((err: Earthstar.EarthstarError) => {
    console.group(`❌ Sync with ${serverUrl} failed`);
    console.log(err);
    console.groupEnd();
  });

  return syncer.isDone();
});

await Promise.allSettled(syncOps);

Deno.exit(0);
