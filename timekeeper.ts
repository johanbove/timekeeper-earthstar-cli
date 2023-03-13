import { APPNAME, DESCRIPTION, NAMESPACE, VERSION } from "./constants.ts";
import { Command, Confirm, Earthstar } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";
import { menu, setMenuItems } from "./src/menu.ts";

import { errored, respond } from "./src/utils/index.ts";

import { list as sequenceList, add as sequenceAdd } from "./src/sequence/index.ts";

import archiveShare from "./user_scripts/scripts/archive_share.ts";
import addShare from "./user_scripts/scripts/add_share.ts";
import newShare from "./user_scripts/scripts/new_share.ts";
import shareInfo from "./user_scripts/scripts/share_info.ts";
import setAuthor from "./user_scripts/scripts/set_author.ts";
import forgetAuthor from "./user_scripts/scripts/forget_author.ts";
import currentAuthor from "./user_scripts/scripts/current_author.ts";
import newAuthor from "./user_scripts/scripts/new_author.ts";
import addServer from "./user_scripts/scripts/add_server.ts";
import listServers from "./user_scripts/scripts/list_servers.ts";
import removeServer from "./user_scripts/scripts/remove_server.ts";
import listShares from "./user_scripts/scripts/list_shares.ts";
import syncAll from "./user_scripts/scripts/sync_all.ts";
import syncServer from "./user_scripts/scripts/sync_with_server.ts";

// Uses localstorage in the scope of this script
const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

let command: string | undefined;
let replica: Earthstar.Replica | undefined;

const initReplica = async (
  settings: Earthstar.SharedSettings,
  share?: string,
) => {
  if (!share) {
    return await pickReplica(settings);
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

    // Checks if we have a registered author in the settings
    // if not it will complain and the user needs to run
    //  ./scripts/new_author.ts
    if (!settings.author) {
      errored(
        "You can't write data without an author keypair. There isn't one saved in the settings. Create a new author or add an existing one. See scripts.",
      );
    }

    if (!settings.shares?.length) {
      errored(
        "Please set a share either by creating a new one or setting an existing share. See scripts.",
      );
    }

    replica = await initReplica(settings, share);
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
      replica = await initReplica(settings, share);
      const menuItems = setMenuItems({ settings, replica });
      const entry: {
        action: string;
        tag?: string;
        comment?: string;
        timestamp?: Date;
      } = {
        action,
      };
      if (tag) {
        entry.tag = tag;
      }
      if (comment) {
        entry.comment = comment;
      }
      if (timestamp) {
        entry.timestamp = new Date(timestamp);
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
      replica = await initReplica(settings, share);
      const menuItems = setMenuItems({ settings, replica });
      const entry: {
        action: string;
        tag?: string;
        comment?: string;
        timestamp?: Date;
      } = {
        action,
      };
      if (tag) {
        entry.tag = tag;
      }
      if (comment) {
        entry.comment = comment;
      }
      if (timestamp) {
        entry.timestamp = new Date(timestamp);
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
      replica = await initReplica(settings, share);
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
  .action(
    async (options: { share?: string; edit?: string; limit?: number }) => {
      const { share, edit, limit } = options;
      replica = await initReplica(settings, share);
      const menuItems = setMenuItems({ settings, replica });
      if (edit?.length) {
        await menuItems.addJournal.action(edit);
      } else {
        await menuItems.journal.action(limit);
      }
    },
  )
  .command("status", "Show status")
  .option("-e, --edit <status:string>", "Set the status")
  .action(async (options: { share?: string; edit?: string }) => {
    const { share, edit } = options;
    replica = await initReplica(settings, share);
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
    replica = await initReplica(settings, share);
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
    replica = await initReplica(settings, share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.showPlan.action();
  })
  .command("project", "Shows the current project")
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(settings, share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.showProject.action();
  })
  .command("reset", "Resets and clears the settings storage")
  .action(async () => {
    const confirmed: boolean = await Confirm.prompt(
      "Please confirm you want to remove all stored settings",
    );
    if (confirmed) {
      respond("Clearing settings:", settings.toString());
      settings.clear();
    }
  })
  .command("sync:dir", "Syncs the share contents with a local drive")
  .action(async (options: { share?: string }) => {
    const { share } = options;
    replica = await initReplica(settings, share);
    const menuItems = setMenuItems({ settings, replica });
    await menuItems.sync_dir.action();
  })
  .command("sync:server", "Sync with server")
  .action(async () => {
    await syncServer(settings);
  })
  .command("sync:all", "Syncs everything")
  .action(async () => {
    await syncAll(settings);
  })
  .command("zip", "Exports the shares content to a zip archive")
  .action(async () => {
    await archiveShare(settings);
  })
  .command("author:set", "Sets the current author")
  .action(async () => {
    await setAuthor(settings);
  })
  .command("author:new", "Creates a new author")
  .action(async () => {
    await newAuthor(settings);
  })
  .command("author:forget", "Forgets the author")
  .action(() => {
    forgetAuthor(settings);
  })
  .command("author:current", "Shows the current author")
  .action(() => {
    currentAuthor(settings);
  })
  .command("share:new", "Creates a new share")
  .action(async () => {
    await newShare(settings);
  })
  .command("share:add", "Adds a share")
  .action(async () => {
    await addShare(settings);
  })
  .command("share:list", "Lists shares")
  .action(() => {
    listShares(settings);
  })
  .command("share:info", "Show info about a share")
  .action(async () => {
    await shareInfo(settings);
  })
  .command("server:add", "Adds a server by passing the address")
  .option("-u, --url <url:string>", "The URL to an Earthstar server")
  .action((options: { share?: string; url?: string }) => {
    const { url } = options;
    if (!url || !url.length) {
      errored("Please provide a server url");
      Deno.exit(1);
    }
    addServer(settings, url);
  })
  .command("server:list", "Lists servers")
  .action(() => {
    listServers(settings);
  })
  .command("server:remove", "Removes a server")
  .action(async () => {
    await removeServer(settings);
  })
  .command("logger", "Logger")
  .option("-t, --text [text:string]", "Adds a log entry")
  .option("-l, --log [log:string]", "Which log to edit?")
  .action(async (options: { share?: string; text?: true | string | undefined; log?: true | string | undefined }) => {
    const { share, text, log = '0' } = options;
    replica = await initReplica(settings, share);
    if (text && typeof text === 'string') {
      await sequenceAdd({ text, replica, settings });
    } else if (log && typeof log === 'string') {
      await sequenceList({
        replica,
        limit: 100,
        log
      });
    }
  })
  .parse(Deno.args);

if (replica) {
  await replica.close(false);
}

Deno.exit(0);
