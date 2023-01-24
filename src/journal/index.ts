import { Earthstar, Input, Table } from "../../deps.ts";
import { getJournalMonthDocPath } from "../utils/index.ts";
import { edit, read } from "../documents/index.ts";

export const add = async (opts: { text?: string, replica: Earthstar.Replica }) => {
    const { replica, text } = opts;

    let _text: string | undefined = text;

    if (!_text) {
        _text = await Input.prompt({
            message: "Enter journal text",
            minLength: 2
        });
    }

    const docPath = getJournalMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    const today = new Date();
    const textWithTimeStamp = `${today.getTime()}\t${_text}`;

    let appendText = textWithTimeStamp;

    if (result?.text) {
        appendText = `${result.text}
${textWithTimeStamp}`;
    }

    await edit({ replica, text: appendText, docPath });
}

export const check = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getJournalMonthDocPath();
    await read({ replica, docPath });
}

export const list = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getJournalMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    // Removes potential empty new lines using the .filter()
    const entries = result?.text.split(/\r?\n/).filter(element => element);

    console.group(`Journal for ${docPath.split('/').slice(-1)}`);

    if (entries?.length) {
        const rows: Array<string>[] = [];
        entries?.reverse().forEach((entry) => {
            const _entry = entry.split(/\t/);
            rows.push([new Date(parseInt(_entry[0], 10)).toLocaleString(), ..._entry.slice(1)]);
        })

        const table: Table = Table.from(rows);

        console.log(table.toString());
    } else {
        console.log('Document not found.');
    }
    console.groupEnd();
}