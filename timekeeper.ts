import { Earthstar, NAMESPACE, Select, SelectOption } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";
import { welcome, generateTimestamp, showSettings } from "./utils/index.ts";
import * as profile from "./profile/index.ts";
import * as documents from "./documents/index.ts";
import * as journal from "./journal/index.ts";
import { timeReport, addTimeEntry, readTimeEntries } from "./timeentries/index.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

if (!settings.author) {
    console.error(
        "You can't write data without an author keypair. There isn't one saved in the settings.",
    );
    Deno.exit(1);
}

// Triggers the replica selection menu at the very beginning
const replica = await pickReplica();

const SEPARATOR = { name: "separator", value: "--------" };

interface SelectOptionWithAction extends SelectOption {
    name: string;
    value: string;
    action: () => Promise<void | boolean | string> | string | boolean | void | number;
}

type SelectOptionWithoutAction = Omit<SelectOptionWithAction, "action">;

/**
 * Defines all of the menu items and their actions
 */
const menuItems: { [keys in string]: SelectOptionWithAction } = {
    addTimeEntry: {
        name: "Track entry",
        value: "addTimeEntry",
        action: async () => await addTimeEntry({ replica })
    },
    timeReport: {
        name: "Time Report",
        value: "timeReport",
        action: async () => await timeReport({ replica })
    },
    readTimeEntries: {
        name: "Check time entries",
        value: "readTimeEntries",
        action: async () => await readTimeEntries({ replica })
    },
    addJournal: {
        name: "Edit journal",
        value: "addJournal",
        action: async () => await journal.add({ replica })
    },
    journal: {
        name: "Read journal",
        value: "journal",
        action: async () => await journal.list({ replica })
    },
    checkJournal: {
        name: "Check journal",
        value: "checkJournal",
        action: async () => await journal.check({ replica })
    },
    showStatus: {
        name: "Show status",
        value: "showStatus",
        action: async () => await profile.showStatus({ settings, replica })
    },
    setStatus: {
        name: "Set status",
        value: "setStatus",
        action: async () => await profile.setStatus({ settings, replica })
    },
    editADocument: {
        name: "Edit a document",
        value: "editADocument",
        action: async () => await documents.edit({ replica })
    },
    readADocument: {
        name: "Read a document",
        value: "readADocument",
        action: async () => await documents.read({ replica })
    },
    removeDocument: {
        name: "Remove a document",
        value: "removeDocument",
        action: async () => await documents.remove({ replica })
    },
    listPaths: {
        name: "List paths",
        value: "listPaths",
        action: async () => await documents.paths({ replica })
    },
    listDocuments: {
        name: "List documents",
        value: "listDocuments",
        action: async () => await documents.list({ replica })
    },
    generateTimestamp: {
        name: "Generate time stamp",
        value: "generateTimestamp",
        action: () => generateTimestamp()
    },
    setDisplayName: {
        name: "Set display name",
        value: "setDisplayName",
        action: async () => await profile.setDisplayName({ settings, replica })
    },
    settings: {
        name: "Show settings",
        value: "settings",
        action: () => showSettings(settings)
    },
}

/**
 * Defines the order in which the menu items appear
 */
const menuItemsWithSeparators: SelectOptionWithAction | SelectOptionWithoutAction[] = [
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
    SEPARATOR,
    menuItems.editADocument,
    menuItems.readADocument,
    menuItems.removeDocument,
    menuItems.listPaths,
    menuItems.listDocuments,
    SEPARATOR,
    menuItems.generateTimestamp,
    menuItems.setDisplayName,
    menuItems.settings,
]

/**
 * Renders menu of app choices
 * @returns 
 */
const menu = async () => {

    await welcome({ settings, replica });

    const action = await Select.prompt({
        message: "What would you like to do?",
        options: menuItemsWithSeparators.map((item) => {
            const { name, value } = item;
            if (name === "separator") {
                return Select.separator(value);
            } else {
                return { name, value };
            }
        }),
        search: true
    });

    return action;
}

const appAction = await menu();

if (appAction && menuItems && menuItems[appAction] && typeof menuItems[appAction].action === 'function') {
    const menuItem = menuItems[appAction];
    menuItem.action();
}

await replica.close(false);

Deno.exit(0);