import { Earthstar, Input, Table } from "../../deps.ts";
import { getJournalMonthDocPath, getJournalDocPathForauthor } from "../utils/index.ts";
import { edit, read } from "../documents/index.ts";
import { LOCALE } from "../../constants.ts";

const LIMIT = 5;

export const add = async (
  opts: { text?: string; replica: Earthstar.Replica; settings: Earthstar.SharedSettings },
) => {
  const { replica, text, settings } = opts;

  let _text: string | undefined = text;

  if (!_text) {
    _text = await Input.prompt({
      message: "Enter journal text",
      minLength: 2,
    });
  }

  const docPathMonth = getJournalMonthDocPath();
  const docPathAuthor = getJournalDocPathForauthor({ settings });

  // Check for an existing document to append to
  const result = await replica.getLatestDocAtPath(docPathMonth);

  if (Earthstar.isErr(result)) {
    console.log(result.message);
    Deno.exit(1);
  }

  const today = new Date();
  const timestamp = today.getTime();
  const textWithTimeStamp = `${timestamp}\t${_text}`;

  let appendText = textWithTimeStamp;

  // Append new entry to the doc
  if (result?.text) {
    appendText = `${result.text}
${textWithTimeStamp}`;
  }

  // Month overview
  await edit({ replica, text: appendText, docPath: docPathMonth });

  // Create entries only for current author where each doc is an individual entry
  await edit({ replica, text, docPath: `${docPathAuthor}/${timestamp}`});
};

export const check = async (opts: { replica: Earthstar.Replica }) => {
  const { replica } = opts;
  const docPath = getJournalMonthDocPath();
  await read({ replica, docPath });
};

export const list = async (
  opts: {
    replica: Earthstar.Replica;
    settings: Earthstar.SharedSettings;
    limit?: number;
  },
) => {
  const { replica, settings, limit } = opts;

  const _limit = typeof limit !== "undefined" ? limit : LIMIT;

  const docPath = getJournalMonthDocPath();

  const result = await replica.getLatestDocAtPath(docPath);

  if (Earthstar.isErr(result)) {
    console.log(result.message);
    Deno.exit(1);
  }

  if (!result) {
    console.log(`Creating new month entry for ${getJournalMonthDocPath()}...`);

    if (!settings.author) {
      throw new Error("Please authenticate with a valid author first.");
    }

    const create = await replica.set(
      settings.author as Earthstar.AuthorKeypair,
      {
        path: getJournalMonthDocPath(),
        text: "",
      },
    );

    if (Earthstar.isErr(create)) {
      console.log(create.message);
      Deno.exit(1);
    }
  }

  // Removes potential empty new lines using the .filter()
  const entries = result?.text.split(/\r?\n/).filter((element) => element);

  console.group(`
Journal for ${docPath.split("/").slice(-1)}

Showing ${_limit} of ${entries?.length} entries.
`);

  if (entries?.length) {
    const rows: Array<string>[] = [];
    const _entries = entries?.slice(-_limit).reverse();
    _entries.forEach((entry) => {
      const _entry = entry.split(/\t/);
      rows.push([
        new Date(parseInt(_entry[0], 10)).toLocaleString(LOCALE),
        ..._entry.slice(1),
      ]);
    });

    const table: Table = Table.from(rows);

    console.log(table.toString());
  } else {
    console.log("Document not found.");
  }
  console.groupEnd();
};
