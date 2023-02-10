import { APPNAME, DESCRIPTION, NAMESPACE, VERSION } from "./constants.ts";
import { Command, Confirm, Earthstar } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";
import { menu, setMenuItems } from "./src/menu.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

// Checks if we have a registered author in the settings
// if not it will complain and the user needs to run
//  ./scripts/new_author.ts
if (!settings.author) {
  console.error(
    "You can't write data without an author keypair. There isn't one saved in the settings. Create a new author or add an existing one. See scripts.",
  );
  Deno.exit(1);
}

if (!settings.shares?.length) {
  console.error(
    "Please set a share either by creating a new one or setting an existing share. See scripts.",
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
};

await new Command()
  .name(APPNAME)
  .version(VERSION)
  .description(DESCRIPTION)
  .meta("deno", Deno.version.deno)
  .meta("v8", Deno.version.v8)
  .meta("typescript", Deno.version.typescript)
  .meta("license", "See LICENSE")
  .globalOption("-s, --share <share:string>", "Set the Earthstar share address")
  // Main Action generates the menu
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(share);
    await menu({ command, settings, replica });
  })
  // Sub commands
  .command("start", "Start a time entry")
  .option("-t, --tag <tag:string>", "Enter the tag")
  .option("-c, --comment <comment:string>", "Enter the comment")
  .option("-d, --timestamp <timestamp:string>", "Enter a timestamp")
  .action(
    async (
      options: {
        share?: string;
        action?: string;
        tag?: string;
        comment?: string;
        timestamp?: string;
      },
    ) => {
      const { share, action = "START", tag, comment, timestamp } = options;
      replica = await initReplica(share);
      const menuItems = setMenuItems({ settings, replica });
      const entry: { action: string; tag?: string; comment?: string, timestamp?: Date } = {
        action,
      };
      if (tag) {
        entry.tag = tag;
      }
      if (comment) {
        entry.comment = comment;
      }
      if (timestamp) {
        entry.timestamp = new Date(timestamp)
      }
      await menuItems.addTimeEntry.action(entry);
    },
  )
  .command("stop", "Stop a time entry")
  .option("-t, --tag <tag:string>", "Enter the tag")
  .option("-c, --comment <comment:string>", "Enter the comment")
  .option("-d, --timestamp <timestamp:string>", "Enter a timestamp")
  .action(
    async (
      options: {
        share?: string;
        action?: string;
        tag?: string;
        comment?: string;
        timestamp?: string;
      },
    ) => {
      const { share, action = "STOP", tag, comment, timestamp } = options;
      replica = await initReplica(share);
      const menuItems = setMenuItems({ settings, replica });
      const entry: { action: string; tag?: string; comment?: string, timestamp?: Date } = {
        action,
      };
      if (tag) {
        entry.tag = tag;
      }
      if (comment) {
        entry.comment = comment;
      }
      if (timestamp) {
        entry.timestamp = new Date(timestamp)
      }
      await menuItems.addTimeEntry.action(entry);
    },
  )
  .command("report", "Time Report")
  .option("-a, --action <action:string>", "Enter START or STOP")
  .option("-t, --tag <tag:string>", "Enter the tag")
  .option("-c, --comment <comment:string>", "Enter the comment")
  .option("-d, --docPath <docPath:string>", "Enter the doc path")
  .action(
    async (
      options: {
        share?: string;
        action?: string;
        tag?: string;
        comment?: string;
        docPath?: string;
      },
    ) => {
      const { share, action, tag, comment, docPath } = options;
      replica = await initReplica(share);
      const menuItems = setMenuItems({ settings, replica });
      if (action) {
        const entry: { action: string; tag?: string; comment?: string } = {
          action,
        };
        if (tag) {
          entry.tag = tag;
        }
        if (comment) {
          entry.comment = comment;
        }
        await menuItems.addTimeEntry.action(entry);
      } else {
        await menuItems.timeReport.action(docPath);
      }
    },
  )
  .command("journal", "Read journal")
  .option("-e, --edit <status:string>", "Sets the journal")
  .option("-l, --limit <limit:number>", "Sets the journal")
  .action(async (options: { share?: string; edit?: string; limit?: number }) => {
    const { share, edit, limit } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    if (edit?.length) {
      await menuItems.addJournal.action(edit);
    } else {
      await menuItems.journal.action(limit);
    }
  })
  .command("status", "Show status")
  .option("-e, --edit <status:string>", "Set the status")
  .action(async (options: { share?: string; edit?: string }) => {
    const { share, edit } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    if (edit?.length) {
      await menuItems.setStatus.action(edit);
    } else {
      await menuItems.showStatus.action();
    }
  })
  .command("timestamp", "Returns a timestamp")
  .option("-d, --date <date:string>", "A date in format yyyy-mm-ddThh:mm")
  .action(async (options: { share?: string; date?: string }) => {
    const { share, date } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    if (date) {
      menuItems.generateTimestamp.action(date);
    } else {
      menuItems.generateTimestamp.action();
    }
  })
  .command("plan", "Shows the current plan")
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.showPlan.action();
  })
  .command("project", "Shows the current project")
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.showProject.action();
  })
  .command("reset", "Resets and clears the settings storage")
  .action(async () => {
    const confirmed: boolean = await Confirm.prompt(
      "Please confirm you want to remove all stored settings",
    );
    if (confirmed) {
      console.log("Clearing settings:", settings);
      settings.clear();
    }
  })
  .command("sync:dir", "Syncs the share contents with a local drive")
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.sync_dir.action();
  })
  .parse(Deno.args);

if (!replica) {
  throw new Error("Please select a replica first.");
}

await replica.close(false);

Deno.exit(0);
