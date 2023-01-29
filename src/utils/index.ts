import { Earthstar } from "../../deps.ts";

export const formatDate = (date: Date) => date.toLocaleString("default");

export const getDisplayName = async (opts: { settings: Earthstar.SharedSettings, replica: Earthstar.Replica }) => {
    const { settings, replica } = opts;
    const docPath = `/about/~${settings.author?.address}/displayName`
    const result = await replica.getLatestDocAtPath(docPath);

    if (Earthstar.isErr(result)) {
        console.log(result.message);
        Deno.exit(1);
    }

    return result?.text ? result?.text : undefined;
}

export const getJournalMonthDocPath = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    return `/journal/${today.getFullYear()}-${month}`;
}

export const getTimeEntriesMonthDocPath = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    return `/entries/${today.getFullYear()}-${month}`;
}

export const welcome = async (opts: { settings: Earthstar.SharedSettings, replica: Earthstar.Replica }) => {
    const { settings, replica } = opts;
    const displayName = await getDisplayName({ settings, replica });

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

export const showSettings = (settings: Earthstar.SharedSettings) => {
    console.group('SETTINGS');
    console.log('settings', settings);
    console.groupEnd();
}

export const generateTimestamp = (date?: string) => {

    let today = new Date();

    if (date) {
        today = new Date(date);
    }

    console.group(`Unix timestamp for ${today.toLocaleString()}`);
    console.log(today.getTime());
    console.groupEnd();
    return today.getTime();
}