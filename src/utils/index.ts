import { Earthstar } from "../../deps.ts";
import {
  ABOUT_FOLDER,
  ENTRIES_FOLDER,
  JOURNAL_FOLDER,
  LOCALE,
} from "../../constants.ts";

export const formatDate = (date: Date) => date.toLocaleString("default");

export const getDisplayName = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  const { settings, replica } = opts;
  const docPath = `${ABOUT_FOLDER}~${settings.author?.address}/displayName`;
  const result = await replica.getLatestDocAtPath(docPath);

  if (Earthstar.isErr(result)) {
    console.log(result.message);
    Deno.exit(1);
  }

  return result?.text ? result?.text : undefined;
};

export const getJournalDocPathForauthor = (
  opts: { settings: Earthstar.SharedSettings },
) => {
  const { settings } = opts;
  return `${JOURNAL_FOLDER}~${settings.author?.address}`;
};

export const getJournalMonthDocPath = () => {
  const today = new Date();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  return `${JOURNAL_FOLDER}${today.getFullYear()}-${month}`;
};

export const getTimeEntriesDocPathForAuthor = (
  opts: { settings: Earthstar.SharedSettings },
) => {
  const { settings } = opts;
  return `${ENTRIES_FOLDER}~${settings.author?.address}`;
};

export const getTimeEntriesMonthDocPath = () => {
  const today = new Date();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  return `${ENTRIES_FOLDER}${today.getFullYear()}-${month}`;
};

export const welcome = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
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
};

export const showSettings = (settings: Earthstar.SharedSettings) => {
  console.group("SETTINGS");
  console.log("settings", settings);
  console.groupEnd();
};

export const generateTimestamp = (date?: string) => {
  let today = new Date();

  if (date) {
    today = new Date(date);
  }

  console.group(`Unix timestamp for ${today.toLocaleString(LOCALE)}`);
  console.log(today.getTime());
  console.groupEnd();
  return today.getTime();
};
