import { Earthstar, Input, NAMESPACE, Table } from "../../deps.ts";

const settings = new Earthstar.SharedSettings({ namespace: NAMESPACE });

export const edit = async (opts: { replica: Earthstar.Replica, text?: string, docPath?: string }) => {
    let { replica, text, docPath } = opts;

    const allPaths = await replica.queryPaths();

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

export const list = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const allLatestDocs = await replica.getLatestDocs();
    console.group(`Found ${allLatestDocs.length} docs`);
    console.log(allLatestDocs);
    console.groupEnd();
}

export const read = async (opts: { replica: Earthstar.Replica, docPath?: string }) => {
    let { replica, docPath } = opts;

    const allPaths = await replica.queryPaths();

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

export const remove = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
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

export const paths = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const allPaths = await replica.queryPaths();

    console.group(`Found ${allPaths.length} paths`);

    for (const path of allPaths) {
        console.log(path);
    }

    console.groupEnd();
}