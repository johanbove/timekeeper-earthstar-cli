import { Earthstar, NAMESPACE, Input, Toggle, Select } from "./deps.ts";
import { pickReplica } from "./helpers/pick_replica.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

console.group('SETTINGS');
console.log('settings', settings);
console.groupEnd();

if (!settings.author) {
    console.error(
        "You can't write data without an author keypair. There isn't one saved in the settings.",
    );
    Deno.exit(1);
}

const replica = await pickReplica();

const prompt = async () => {
    const action = await Select.prompt({
        message: "What would you like to do?",
        options: [
            { name: "Edit a document", value: "editADocument" },
            { name: "Read a document", value: "readADocument" },
            { name: "List paths", value: "listPaths" },
            { name: "List documents", value: "listDocuments" },
            { name: "Settings", value: "settings", disabled: true },
            Select.separator("--------"),
        ],
    });
    return action;
}

const listPaths = async () => {
    const allPaths = await replica.queryPaths();

    console.group('listPaths');

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
    const docPath = await Input.prompt({
        message: "Enter document path",
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
        console.log(result?.author);
        console.log(result?.text);
        console.log(new Date(result?.timestamp / 1000).toISOString());
    } else {
        console.log('Document not found.');
    }
    console.groupEnd();

}

const appAction = await prompt();

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
    default:
        console.log('Please pick an action.');
        break;
}

await replica.close(false);

Deno.exit(0);

