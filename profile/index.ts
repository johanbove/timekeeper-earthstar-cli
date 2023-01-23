import { Earthstar, Input, Table } from "../deps.ts";

export const setDisplayName = async (opts: { settings: Earthstar.SharedSettings, replica: Earthstar.Replica }) => {
    const { replica, settings } = opts;
    
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

export const setStatus = async (opts: { settings: Earthstar.SharedSettings, replica: Earthstar.Replica }) => {
    const { replica, settings } = opts;
    
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

export const showStatus = async (opts: { settings: Earthstar.SharedSettings, replica: Earthstar.Replica }) => {
    const { replica, settings } = opts;
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
