import { Earthstar, NAMESPACE, Command } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";
import { menu, setMenuItems } from "./src/menu.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

// Checks if we have a registered author in the settings
// if not it will complain and the user needs to run
//  ./scripts/new_author.ts
if (!settings.author) {
    console.error(
        "You can't write data without an author keypair. There isn't one saved in the settings. Run ./scripts/new_author.ts",
    );
    Deno.exit(1);
}

let command: string | undefined;
let replica: Earthstar.Replica | undefined;

const initReplica = async (share?: string) => {
    if (!share) {
       return await pickReplica();
    }
    const shareKeypair = { address: share, secret: settings.shareSecrets[share] };
    return new Earthstar.Replica({
        driver: new Earthstar.ReplicaDriverFs(
            shareKeypair.address,
            `./share_data/${shareKeypair.address}/`,
        ),
        shareSecret: shareKeypair.secret,
    });
}

await new Command()
    .name("timekeeper")
    .version("0.1.0")
    .description("Earthstar Timekeeper")
    .globalOption("-s, --share <share:string>", "Set the share address")
    // Main Action generates the menu
    .action(async (options: { share?: string }) => {
        const { share } = options;
        replica = await initReplica(share);
        await menu({ command, settings, replica });
    })
    // Sub commands
    .command("report", "Time Report")
    .action(async (options: { share?: string }) => {
        const { share } = options;
        replica = await initReplica(share);
        const menuItems = setMenuItems({ settings, replica });
        await menuItems.timeReport.action();
    })
    .command("journal", "Read journal")
    .action(async (options: { share?: string }) => {
        const { share } = options;
        replica = await initReplica(share);
        const menuItems = setMenuItems({ settings, replica });
        await menuItems.journal.action();
    })
    .parse(Deno.args);

if (!replica) {
    throw new Error('Please select a replica first.');
}

await replica.close(false);

Deno.exit(0);