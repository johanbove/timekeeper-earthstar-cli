import { Earthstar, Input, Table, Select, TAGS, COMMENTS } from "../deps.ts";
import { getTimeEntriesMonthDocPath } from "../utils/index.ts";
import { edit, read } from "../documents/index.ts";

export const readTimeEntries = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getTimeEntriesMonthDocPath();
    await read({ replica, docPath });
}

export const addTimeEntry = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const action = await Select.prompt({
        message: "Action",
        options: [
            { name: "START", value: "START" },
            { name: "STOP", value: "STOP" },
        ],
    });

    /**
     * @TODO Add list of existing tags to pick from
     */
    const tag = await Input.prompt({
        message: "Enter tag",
        minLength: 2,
        suggestions: TAGS
    });

    const comment = await Input.prompt({
        message: "Enter comment",
        suggestions: COMMENTS
    });

    const docPath = getTimeEntriesMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    if (!action) {
        console.log('Please define an action!');
        return;
    }

    const today = new Date();
    const textWithTimeStamp = `${today.getTime()}\t${action}\t${tag}\t${comment}`;

    let appendText = textWithTimeStamp;

    if (result?.text) {
        appendText = `${result.text}
${textWithTimeStamp}`;
    }

    await edit({ replica, text: appendText, docPath });
}

export const timeReport = async (opts: { replica: Earthstar.Replica }) => {
    const { replica } = opts;
    const docPath = getTimeEntriesMonthDocPath();

    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    // Removes potential empty new lines using the .filter()
    const entries = result?.text.split(/\r?\n/).filter(element => element);

    console.group(`Time Report for ${docPath.split('/').slice(-1)}`);

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