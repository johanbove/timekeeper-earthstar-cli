import { Earthstar } from "../../deps.ts";
import { ENTRIES_FOLDER, JOURNAL_FOLDER, LOCALE } from "../../constants.ts";
import { getDisplayName } from "../profile/index.ts";

export const formatDate = (date: Date) => date.toLocaleString("default");

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
    respond(`
Welcome back ${displayName} 👋
    `);
  } else {
    respond(`
Hello 👋
        `);
  }
};

export const showSettings = (settings: Earthstar.SharedSettings) => {
  render("SETTINGS", settings);
};

export const generateTimestamp = (date?: string) => {
  let today = new Date();

  if (date) {
    today = new Date(date);
  }

  render(`Unix timestamp for ${today.toLocaleString(LOCALE)}`, today.getTime());

  return today.getTime();
};

/**
 * @see https://www.slingacademy.com/article/javascript-how-to-convert-a-string-to-a-url-slug/
 * @param str
 * @returns
 */
export const stringToSlug = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\W_]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
};

/**
 * Wrapper over console.log
 * @param text
 */
export const log = <T>(...args: T[]) => {
  console.log.apply(console, args);
};

export const respond = log;

/**
 * Wrapper over console.error
 * @param text
 */
export const errored = <T>(...args: T[]) => {
  console.error.apply(console, args);
};

export const render = <T, K>(title: T, content: K) => {
  console.group(title);
  respond<K>(content);
  console.groupEnd();
};
