import { Earthstar, NAMESPACE, Select } from "./deps.ts";
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

/**
 * Renders menu of app choices
 * @returns 
 */
const menu = async () => {

    await welcome({ settings, replica });

    const action = await Select.prompt({
        message: "What would you like to do?",
        options: [
            { name: "Track entry", value: "addTimeEntry" },
            { name: "Time Report", value: "timeReport" },
            { name: "Check time entries", value: "readTimeEntries" },
            Select.separator("--------"),
            { name: "Edit journal", value: "addJournal" },
            { name: "Read journal", value: "journal" },
            { name: "Check journal", value: "checkJournal" },
            Select.separator("--------"),
            { name: "Show status", value: "showStatus" },
            { name: "Set status", value: "setStatus" },
            Select.separator("--------"),
            { name: "Edit a document", value: "documents.edit" },
            { name: "Read a document", value: "readADocument" },
            { name: "Remove a document", value: "removeDocument" },
            { name: "List paths", value: "listPaths" },
            { name: "List documents", value: "listDocuments" },
            Select.separator("--------"),
            { name: "Generate time stamp", value: "generateTimestamp" },
            { name: "Set display name", value: "setDisplayName" },
            { name: "Show settings", value: "settings" },
        ],
        search: true
    });

    return action;
}

const appAction = await menu();

switch (appAction) {
    case "editADocument":
        await documents.edit({ replica });
        break;
    case "readADocument":
        await documents.read({ replica });
        break;
    case "removeDocument":
        await documents.remove({ replica });
        break;
    case "listPaths":
        await documents.paths({ replica });
        break;
    case "listDocuments":
        await documents.list({ replica });
        break;
    case "settings":
        showSettings(settings);
        break;
    case "setDisplayName":
        await profile.setDisplayName({ settings, replica });
        break;
    case "showStatus":
        await profile.showStatus({ settings, replica });
        break;
    case "setStatus":
        await profile.setStatus({ settings, replica });
        break;
    case "addJournal":
        await journal.add({ replica });
        break;
    case "checkJournal":
        await journal.check({ replica });
        break;
    case "journal":
        await journal.list({ replica });
        break;
    case "readTimeEntries":
        await readTimeEntries({ replica });
        break;
    case "addTimeEntry":
        await addTimeEntry({ replica });
        break;
    case "generateTimestamp":
        generateTimestamp();
        break;
    case "timeReport":
        await timeReport({ replica });
        break;
    default:
        console.log('Please pick an action.');
        break;
}

await replica.close(false);

Deno.exit(0);