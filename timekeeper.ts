import { NAMESPACE, VERSION, DESCRIPTION, APPNAME } from "./constants.ts";
import { Earthstar, Command } from "./deps.ts";
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
    .name(APPNAME)
    .version(VERSION)
    .description(DESCRIPTION)
    .meta("deno", Deno.version.deno)
    .meta("v8", Deno.version.v8)
    .meta("typescript", Deno.version.typescript)
    .globalOption("-s, --share <share:string>", "Set the Earthstar share address")
    // Main Action generates the menu
    .action(async (options: { share?: string }) => {
        const { share } = options;
        replica = await initReplica(share);
        await menu({ command, settings, replica });
    })
    // Sub commands
    .command("report", "Time Report")
    .option("-a, --action <action:string>", "Enter START or STOP")
    .option("-t, --tag <tag:string>", "Enter the tag")
    .option("-c, --comment <comment:string>", "Enter the comment")
    .action(async (options: { share?: string, action?: string, tag?: string, comment?: string }) => {
        const { share, action, tag, comment } = options;
        replica = await initReplica(share);
        const menuItems = setMenuItems({ settings, replica });
        if (action) {
            const entry: { action: string, tag?: string, comment?: string } = { action };
            if (tag) {
                entry.tag = tag;
            }
            if (comment) {
                entry.comment = comment;
            }
            await menuItems.addTimeEntry.action(entry);
        } else {
            await menuItems.timeReport.action();
        }
    })
    .command("journal", "Read journal")
    .option("-e, --edit <status:string>", "Sets the journal")
    .action(async (options: { share?: string, edit?: string }) => {
        const { share, edit } = options;
        replica = await initReplica(share);
        const menuItems = setMenuItems({ settings, replica });
        if (edit?.length) {
            await menuItems.addJournal.action(edit);
        } else {
            await menuItems.journal.action();
        }
    })
    .command("status", "Show status")
    .option("-e, --edit <status:string>", "Set the status")
    .action(async (options: { share?: string, edit?: string }) => {
        const { share, edit } = options;
        replica = await initReplica(share);
        const menuItems = setMenuItems({ settings, replica });
        if (edit?.length) {
            await menuItems.setStatus.action(edit);
        } else {
            await menuItems.showStatus.action();
        }
    })
    .parse(Deno.args);

if (!replica) {
    throw new Error('Please select a replica first.');
}

await replica.close(false);

Deno.exit(0);