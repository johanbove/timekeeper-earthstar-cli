import { Earthstar, NAMESPACE, Input, Table, Select } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

if (!settings.author) {
    console.error(
        "You can't write data without an author keypair. There isn't one saved in the settings.",
    );
    Deno.exit(1);
}

const replica = await pickReplica();

/**
 * Renders menu of app choices
 * @returns 
 */
const menu = async () => {
    const action = await Select.prompt({
        message: "What would you like to do?",
        options: [
            { name: "Edit a document", value: "editADocument" },
            { name: "Read a document", value: "readADocument" },
            { name: "List paths", value: "listPaths" },
            { name: "List documents", value: "listDocuments" },
            Select.separator("--------"),
            { name: "Set display name", value: "setDisplayName" },
            { name: "Set status", value: "setStatus" },
            Select.separator("--------"),
            { name: "Show settings", value: "settings" },
        ],
    });
    return action;
}

const showSettings = () => {
    console.group('SETTINGS');
    console.log('settings', settings);
    console.groupEnd();
}

const listPaths = async () => {
    const allPaths = await replica.queryPaths();

    console.group(`Found ${allPaths.length} paths`);

    for (const path of allPaths) {
        console.log(path);
    }

    console.groupEnd();
}

const editADocument = async () => {
    const allPaths = await replica.queryPaths();

    const text = await Input.prompt({
        message: "Enter document text",
    });

    const docPath = await Input.prompt({
        message: "Enter document path",
        suggestions: allPaths
    });

    if (settings.author && text && docPath) {
        const result = await replica.set(settings.author, {
            path: docPath,
            text: text,
        });

        if (Earthstar.isErr(result)) {
            console.log(result.message);
            Deno.exit(1);
        }

        console.group(docPath);
        console.log(result);
        console.groupEnd();
    }
}

const listDocuments = async () => {
    const allLatestDocs = await replica.getLatestDocs();
    console.group(`Found ${allLatestDocs.length} docs`);
    console.log(allLatestDocs);
    console.groupEnd();
}

const readADocument = async () => {
    const allPaths = await replica.queryPaths();

    const docPath = await Input.prompt({
        message: "Enter document path",
        minLength: 1,
        suggestions: allPaths
    });

    if (!docPath) {
        console.error("Please pick a path");
        return
    }

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    console.group(docPath);
    if (result) {
        const table: Table = new Table(
            [new Date(result?.timestamp / 1000).toISOString(), result?.author, result?.text],
        );
        console.log(table.toString());
    } else {
        console.log('Document not found.');
    }
    console.groupEnd();

}

const setDisplayName = async () => {
    const displayName = await Input.prompt({
        message: "Enter a name",
    });

    if (settings.author && displayName && displayName.length) {
        const result = await replica.set(settings.author, {
            path: `/about/~${settings.author?.address}/displayName`,
            text: displayName,
        });

        if (Earthstar.isErr(result)) {
            console.log(result.message);
            Deno.exit(1);
        }

        console.group('DisplayName');
        console.log(`Hello ${displayName}`);
        console.groupEnd();
    }
}

const setStatus = async () => {
    const status = await Input.prompt({
        message: "Enter a status",
    });

    if (settings.author && status && status.length) {
        const result = await replica.set(settings.author, {
            path: `/about/~${settings.author?.address}/status`,
            text: status,
        });

        if (Earthstar.isErr(result)) {
            console.log(result.message);
            Deno.exit(1);
        }

        console.group('Status');
        console.log(`${status}`);
        console.groupEnd();
    }
}

const appAction = await menu();

switch (appAction) {
    case "editADocument":
        await editADocument();
        break;
    case "readADocument":
        await readADocument();
        break;
    case "listPaths":
        await listPaths();
        break;
    case "listDocuments":
        await listDocuments();
        break;
    case "settings":
        showSettings();
        break;
    case "setDisplayName":
        await setDisplayName();
        break;
    case "setStatus":
        await setStatus();
        break;
    default:
        console.log('Please pick an action.');
        break;
}

await replica.close(false);

Deno.exit(0);