import { Earthstar, Select, Input } from "../deps.ts";
import type { SelectOption } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import * as profile from "./profile/index.ts";
import * as documents from "./documents/index.ts";
import * as journal from "./journal/index.ts";
import { generateTimestamp, showSettings, welcome } from "./utils/index.ts";
import {
  addTimeEntry,
  Entry,
  readTimeEntries,
  timeReport,
} from "./timeentries/index.ts";

const SEPARATOR = { name: "separator", value: "--------" };

interface SelectOptionWithAction extends SelectOption {
  name: string;
  value: string;
  action: <T>(opts?: T) => void | Promise<T | void> | T | number;
}

type SelectOptionWithoutAction = Omit<SelectOptionWithAction, "action">;

/**
 * Defines all of the menu items and their actions
 */
export const setMenuItems = (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
): { [keys in string]: SelectOptionWithAction } => {
  const { replica, settings } = opts;
  return {
    addTimeEntry: {
      name: "Track entry",
      value: "addTimeEntry",
      // @ts-ignore TS2208
      action: async (entry?: Entry) => {
        if (entry) {
          await addTimeEntry(
            { entry, replica, settings } as {
              entry: Entry;
              replica: Earthstar.Replica;
              settings: Earthstar.SharedSettings;
            },
          );
        } else {
          await addTimeEntry(
            { replica, settings } as {
              replica: Earthstar.Replica;
              settings: Earthstar.SharedSettings;
            },
          );
        }
      },
    },
    timeReport: {
      name: "Time Report",
      value: "timeReport",
      action: async (docPath?) =>
        await timeReport(
          { replica, docPath, settings } as {
            replica: Earthstar.Replica;
            docPath?: string;
            settings: Earthstar.SharedSettings;
          },
        ),
    },
    readTimeEntries: {
      name: "Check time entries",
      value: "readTimeEntries",
      action: async () => await readTimeEntries({ replica }),
    },
    addJournal: {
      name: "Edit journal",
      value: "addJournal",
      action: async (text?) =>
        await journal.add(
          { text, replica, settings } as {
            text?: string;
            replica: Earthstar.Replica;
            settings: Earthstar.SharedSettings;
          },
        ),
    },
    journal: {
      name: "Read journal",
      value: "journal",
      action: async (limit) =>
        await journal.list(
          { replica, settings, limit } as {
            replica: Earthstar.Replica;
            settings: Earthstar.SharedSettings;
            limit: number;
          },
        ),
    },
    checkJournal: {
      name: "Check journal",
      value: "checkJournal",
      action: async () => await journal.check({ replica }),
    },
    showStatus: {
      name: "Show status",
      value: "showStatus",
      action: async () => await profile.showStatus({ settings, replica }),
    },
    setStatus: {
      name: "Set status",
      value: "setStatus",
      // @ts-ignore TS2322
      action: async (status?: string) =>
        await profile.setStatus({ status, settings, replica } as {
          status?: string;
          settings: Earthstar.SharedSettings;
          replica: Earthstar.Replica;
        }),
    },
    showPlan: {
      name: "Show plan",
      value: "showPlan",
      action: async () => await profile.showPlan({ settings, replica }),
    },
    showProject: {
      name: "Show project",
      value: "showProject",
      action: async () => await profile.showProject({ settings, replica }),
    },
    editADocument: {
      name: "Edit a document",
      value: "editADocument",
      action: async () => await documents.edit({ replica }),
    },
    addBlogPost: {
      name: "Blog: Add a post",
      value: "addBlogPost",
      // @ts-ignore TS2322
      action: async (title: string, description: string) =>
        await documents.blogAdd(
          { title, replica, description } as {
            title: string;
            description?: string;
            replica: Earthstar.Replica;
          },
        ),
    },
    editBlogPostMeta: {
      name: "Blog: Edit meta data for a post",
      value: "editBlogPostMeta",
      // @ts-ignore TS2322
      action: async (title: string, description: string) =>
        await documents.blogMeta(
          { title, replica, description } as {
            title: string;
            description?: string;
            replica: Earthstar.Replica;
          },
        ),
    },
    readADocument: {
      name: "Read a document",
      value: "readADocument",
      action: async () => await documents.read({ replica }),
    },
    removeDocument: {
      name: "Remove a document",
      value: "removeDocument",
      action: async () => await documents.remove({ replica }),
    },
    listPaths: {
      name: "List paths",
      value: "listPaths",
      action: async () => await documents.paths({ replica }),
    },
    listDocuments: {
      name: "List documents",
      value: "listDocuments",
      action: async () => await documents.list({ replica }),
    },
    generateTimestamp: {
      name: "Generate time stamp",
      value: "generateTimestamp",
      action: (opts): number => generateTimestamp(opts as string),
    },
    setDisplayName: {
      name: "Set display name",
      value: "setDisplayName",
      action: async () => await profile.setDisplayName({ settings, replica }),
    },
    settings: {
      name: "Show settings",
      value: "settings",
      action: () => showSettings(settings),
    },
    sync_dir: {
      name: "Sync dir",
      value: "sync_dir",
      // @ts-ignore TS2322
      action: async (dirPath?: string) => {
        if (!dirPath) {
          dirPath = await Input.prompt({
            message: "Enter folder to sync to",
          });
        }

        await Earthstar.syncReplicaAndFsDir({
          replica,
          dirPath: dirPath || "./data",
          keypair: settings.author as Earthstar.AuthorKeypair,
          allowDirtyDirWithoutManifest: true,
          overwriteFilesAtOwnedPaths: true,
        });

        console.log(`Synced ${replica.share} with ${dirPath}`);
      },
    },
  };
};

/**
 * Renders menu of app choices
 * @returns
 */
export const menu = async (
  opts: {
    command?: string;
    settings: Earthstar.SharedSettings;
    replica: Earthstar.Replica;
  },
) => {
  const { replica, settings, command } = opts;

  const menuItems = setMenuItems({ settings, replica });

  /**
   * Defines the order in which the menu items appear
   */
  const menuItemsWithSeparators:
    | SelectOptionWithAction
    | SelectOptionWithoutAction[] = [
      menuItems.addTimeEntry,
      menuItems.timeReport,
      menuItems.readTimeEntries,
      SEPARATOR,
      menuItems.addJournal,
      menuItems.journal,
      menuItems.checkJournal,
      SEPARATOR,
      menuItems.showStatus,
      menuItems.setStatus,
      menuItems.showPlan,
      menuItems.showProject,
      SEPARATOR,
      menuItems.editADocument,
      menuItems.readADocument,
      menuItems.removeDocument,
      menuItems.listDocuments,
      menuItems.listPaths,
      SEPARATOR,
      menuItems.addBlogPost,
      menuItems.editBlogPostMeta,
      SEPARATOR,
      menuItems.sync_dir,
      SEPARATOR,
      menuItems.generateTimestamp,
      menuItems.setDisplayName,
      menuItems.settings,
    ];

  await welcome({ settings, replica });

  let action = await Select.prompt({
    message: "What would you like to do?",
    options: menuItemsWithSeparators.map((item) => {
      const { name, value } = item;
      if (name === "separator") {
        return Select.separator(value);
      } else {
        return { name, value };
      }
    }),
    search: true,
  });

  if (command) {
    action = command;
  }

  if (
    action && menuItems && menuItems[action] &&
    typeof menuItems[action].action === "function"
  ) {
    const menuItem = menuItems[action];
    await menuItem.action();
  } else {
    throw new Error("Invalid command passed.");
  }
};
