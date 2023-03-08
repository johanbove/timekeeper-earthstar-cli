import { AttachmentDriverMemory, DocDriverMemory, Replica, ReplicaDriverMemory, ShareKeypair } from "https://deno.land/x/earthstar@v10.0.2/mod.ts";

export function makeReplica(addr: string, shareSecret: string) {
    return new Replica({
      driver: {
        docDriver: new DocDriverMemory(addr),
        attachmentDriver: new AttachmentDriverMemory(),
      },
      shareSecret,
    });
  }

export function makeReplicasForShare(keypair: ShareKeypair, count: number) {
    const replicas = [];

    for (let i = 0; i < count; i++) {
        const replica = new Replica({
            driver: new ReplicaDriverMemory(keypair.shareAddress),
            shareSecret: keypair.secret,
        });

        replicas.push(replica);
    }

    return replicas;
}