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

const getDisplayName = async () => {
    const docPath = `/about/~${settings.author?.address}/displayName`
    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    return result?.text ? result?.text : undefined;
}

const welcome = async () => {
    const displayName = await getDisplayName();

    if (displayName) {
        console.log(`
Welcome back ${displayName} 👋
    `);
    } else {
        console.log(`
Hello 👋
        `);
    }
} 

/**
 * Renders menu of app choices
 * @returns 
 */
const menu = async () => {
    
    await welcome();

    const action = await Select.prompt({
        message: "What would you like to do?",
        options: [
            { name: "Edit a document", value: "editADocument" },
            { name: "Read a document", value: "readADocument" },
            { name: "Remove a document", value: "removeDocument" },
            { name: "Edit journal", value: "addJournal" },
            { name: "Read journal", value: "readJournal" },
            { name: "List paths", value: "listPaths" },
            { name: "List documents", value: "listDocuments" },
            Select.separator("--------"),
            { name: "Show status", value: "showStatus" },
            { name: "Set status", value: "setStatus" },
            Select.separator("--------"),
            { name: "Set display name", value: "setDisplayName" },
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

const editADocument = async (opts: { text?: string, docPath?: string} = {}) => {
    const allPaths = await replica.queryPaths();

    let { text, docPath } = opts;

    if (!text) {
        text = await Input.prompt({
            message: "Enter document text",
        });
    }

    if (!docPath) {
        docPath = await Input.prompt({
            message: "Enter document path",
            suggestions: allPaths
        });
    }

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

const readADocument = async (opts: { docPath?: string} = {}) => {
    const allPaths = await replica.queryPaths();

    let { docPath } = opts;

    if (!docPath) {
        docPath = await Input.prompt({
            message: "Enter document path",
            minLength: 1,
            suggestions: allPaths
        });
    }

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    console.group(docPath);
    if (result) {
        const table: Table = new Table(
            [new Date(result?.timestamp / 1000).toLocaleString(), result?.author, result?.text],
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

const showStatus = async () => {
    const docPath = `/about/~${settings.author?.address}/status`
    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    console.group(docPath);
    if (result) {
        const table: Table = new Table(
            [new Date(result?.timestamp / 1000).toLocaleString(), result?.text],
        );
        console.log(table.toString());
    } else {
        console.log('Document not found.');
    }
    console.groupEnd();
}

const addJournal = async () => {
    const text = await Input.prompt({
        message: "Enter journal text",
        minLength: 2
    });

    const today = new Date();
    const docPath = `/journal/${today.getFullYear()}-${today.getMonth()}`;

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }
    
    const textWithTimeStamp = `${today.getTime()}\t${text}`;

    let appendText = textWithTimeStamp;

    if (result?.text) {
        appendText = `${result.text}
${textWithTimeStamp}
        `;
    }

    // Warning this will overwrite existing contents!!
    await editADocument({ text: appendText, docPath });
}

const removeDocument = async () => {
    const allPaths = await replica.queryPaths();

    const docPath = await Input.prompt({
        message: "Enter document path to delete",
        suggestions: allPaths
    });

    if (settings.author && docPath) {
        const result = await replica.wipeDocAtPath(settings.author, docPath);

        if (Earthstar.isErr(result)) {
            console.log(result.message);
            Deno.exit(1);
        }

        console.group(`Wiped ${docPath}`);
        console.log(result);
        console.groupEnd();
    }
}

const readJournal = async () => {
    const today = new Date();
    const docPath = `/journal/${today.getFullYear()}-${today.getMonth()}`;

    // Warning this will overwrite existing contents!!
    await readADocument({ docPath });
}

const appAction = await menu();

switch (appAction) {
    case "editADocument":
        await editADocument();
        break;
    case "readADocument":
        await readADocument();
        break;
    case "removeDocument":
        await removeDocument();
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
    case "showStatus":
        await showStatus();
        break;
    case "setStatus":
        await setStatus();
        break;
    case "addJournal":
        await addJournal();
        break;
    case "readJournal":
        await readJournal();
        break;
    default:
        console.log('Please pick an action.');
        break;
}

await replica.close(false);

Deno.exit(0);