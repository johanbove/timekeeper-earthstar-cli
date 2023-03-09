import { Confirm, Earthstar, Input, Table } from "../../deps.ts";
import { errored, log, render, respond, stringToSlug } from "../utils/index.ts";

export const edit = async (
  opts: {
    replica: Earthstar.Replica;
    settings: Earthstar.SharedSettings;
    text?: string;
    docPath?: string;
    timestamp?: string;
    attachment?: Uint8Array | ReadableStream<Uint8Array>;
  },
) => {
  let { replica, text, docPath, timestamp, attachment, settings } = opts;
  let deleteAfter;

  const allPaths = await replica.queryPaths();

  if (!docPath) {
    docPath = await Input.prompt({
      message: "Enter document path",
      suggestions: allPaths,
    });
  }

  if (!text) {
    text = await Input.prompt({
      message: "Enter document text",
    });
  }

  if (docPath.indexOf("!") !== -1) {
    const confirmed: boolean = await Confirm.prompt(
      "Detected a ! in the docpath. Do you want to create an ephemeral doc?",
    );

    if (!confirmed) {
      respond("Ok. Then please start over.");
      return;
    }

    timestamp = await Input.prompt({
      message: "Enter a time and a date when this document should expire",
      suggestions: allPaths,
    });

    const _date = new Date(timestamp);

    if (!_date) {
      errored("That is an invalid date. Enter a date like YYYY-MM-DDTHH:MM:SS");
      Deno.exit(1);
    }

    // time in micro seconds!
    deleteAfter = _date.getTime() * 1000;

    respond(
      `This document will expire after ${new Date(deleteAfter / 1000)}.`,
    );
  }

  if (settings.author && text && docPath) {
    const result = await replica.set(settings.author, {
      path: docPath,
      text: text,
      deleteAfter,
      attachment,
    });

    if (Earthstar.isErr(result)) {
      errored(result.message);
      Deno.exit(1);
    }

    render(docPath, result);

    return result;
  }
};

export const add = edit;

/**
 * Allows to add the meta data to a blog "post.md" file.
 * @param opts
 */
export const blogMeta = async (
  opts: {
    title: string;
    description?: string;
    replica: Earthstar.Replica;
    docPath?: string;
    settings: Earthstar.SharedSettings;
  },
) => {
  const { title, description, replica, docPath, settings } = opts;
  let _title = title;
  let _description = description;

  const blogPostQuery = {
    filter: {
      pathStartsWith: "/blog/1.0/",
    },
    limit: 5,
  };

  const allPosts = await replica.queryPaths(blogPostQuery);

  let text = JSON.stringify({});
  let _docPath = docPath;

  if (!docPath) {
    _docPath = await Input.prompt({
      message: "Which blog post?",
      minLength: 1,
      suggestions: allPosts,
    });
  }

  if (!title) {
    _title = await Input.prompt({
      message: "Enter document title",
      minLength: 1,
    });
  }

  if (!description) {
    _description = await Input.prompt({
      message: "Enter document description",
    });
  }

  if (_title && _description) {
    text = JSON.stringify({ title: _title, description: _description });
  } else if (!_description) {
    text = JSON.stringify({ title: _title });
  }

  await edit({ settings, text, replica, docPath: _docPath });
};

/**
 * Creates a new blog post file
 * @param opts
 */
export const blogAdd = async (
  opts: {
    title: string;
    description?: string;
    replica: Earthstar.Replica;
    docPath?: string;
    settings: Earthstar.SharedSettings;
  },
) => {
  const { title, description, replica, docPath, settings } = opts;
  let _title = title;
  let _description = description;

  let text = JSON.stringify({});
  let _docPath = docPath;

  const today = new Date();

  if (!title) {
    _title = await Input.prompt({
      message: "Enter document title",
      minLength: 1,
    });
  }

  const slug = stringToSlug(_title);
  const postfolder = `${today.getFullYear()}/${
    ("0" + (today.getMonth() + 1)).slice(-2)
  }/${("0" + today.getDate()).slice(-2)}`;

  if (!_docPath && settings.author?.address) {
    _docPath =
      `/blog/1.0/~${settings.author.address}/${postfolder}/${slug}/post.md`;
  }

  if (!description) {
    _description = await Input.prompt({
      message: "Enter document description",
    });
  }

  // @see https://medium.com/deno-the-complete-reference/textencoder-and-textdecoder-in-deno-cfca83be1792
  // Cannot be totally empty!
  const attachment = new TextEncoder().encode(
    _description?.length ? _description : " ",
  );

  if (_title && _description) {
    text = JSON.stringify({ title: _title, description: _description });
  } else if (!_description) {
    text = JSON.stringify({ title: _title });
  }

  await edit({ settings, text, replica, docPath: _docPath, attachment });
};

export const list = async (opts: { replica: Earthstar.Replica }) => {
  const { replica } = opts;
  const allLatestDocs = await replica.getLatestDocs();
  render(`Found ${allLatestDocs.length} docs`, allLatestDocs);
};

export const read = async (
  opts: { replica: Earthstar.Replica; docPath?: string },
) => {
  let { replica, docPath } = opts;

  const allPaths = await replica.queryPaths();

  if (!docPath) {
    docPath = await Input.prompt({
      message: "Enter document path",
      minLength: 1,
      suggestions: allPaths,
    });
  }

  const result = await replica.getLatestDocAtPath(docPath);

  if (Earthstar.isErr(result)) {
    errored(result.message);
    Deno.exit(1);
  }

  console.group(docPath);
  if (result) {
    const table: Table = new Table(
      [
        new Date(result?.timestamp / 1000).toLocaleString(),
        result?.author,
        result?.text,
      ],
    );
    log(table.toString());
  } else {
    errored("Document not found.");
  }
  console.groupEnd();

  return result;
};

export const remove = async (
  opts: { replica: Earthstar.Replica; settings: Earthstar.SharedSettings },
) => {
  const { replica, settings } = opts;
  const allPaths = await replica.queryPaths();

  const docPath = await Input.prompt({
    message: "Enter document path to delete",
    suggestions: allPaths,
  });

  if (settings.author && docPath) {
    const result = await replica.wipeDocAtPath(settings.author, docPath);

    if (Earthstar.isErr(result)) {
      errored(result.message);
      Deno.exit(1);
    }

    render(`Wiped ${docPath}`, result);
  }
};

export const paths = async (opts: { replica: Earthstar.Replica }) => {
  const { replica } = opts;
  const allPaths = await replica.queryPaths();

  console.group(`Found ${allPaths.length} paths`);

  for (const path of allPaths) {
    log(path);
  }

  console.groupEnd();
};
