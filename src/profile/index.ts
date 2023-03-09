import { Earthstar, Input, Table } from "../../deps.ts";
import { ABOUT_FOLDER, LOCALE } from "../../constants.ts";

export const setDisplayName = async (
  opts: {
    settings: Earthstar.SharedSettings;
    replica: Earthstar.Replica;
    name?: string;
  },
) => {
  const { replica, settings, name } = opts;

  if (name) {
    Input.inject(name);
  }

  const text = await Input.prompt({
    message: "Enter a name",
  });

  if (!settings.author) {
    throw new Error("Please define an author key pair first.");
  }

  const result = await replica.set(settings.author, {
    path: `${ABOUT_FOLDER}~${settings.author?.address}/displayName`,
    text,
  });

  if (Earthstar.isErr(result)) {
    throw new Error(result.message);
  }

  console.group("Displayname");
  console.log(`${text}`);
  console.groupEnd();

  return result;
};

export const getDisplayName = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  const { settings, replica } = opts;
  const docPath = `${ABOUT_FOLDER}~${settings.author?.address}/displayName`;
  const result = await replica.getLatestDocAtPath(docPath);

  if (Earthstar.isErr(result)) {
    throw new Error(result.message);
  }

  return result?.text ? result?.text : undefined;
};

export const setStatus = async (
  opts: {
    status?: string;
    settings: Earthstar.SharedSettings;
    replica: Earthstar.Replica;
  },
) => {
  const { replica, settings, status } = opts;

  if (status) {
    Input.inject(status);
  }

  const text = await Input.prompt({
    message: "Enter a status",
  });

  if (!settings.author) {
    throw new Error("Please define an author key pair first.");
  }

  const result = await replica.set(settings.author, {
    path: `${ABOUT_FOLDER}~${settings.author?.address}/status`,
    text,
  });

  if (Earthstar.isErr(result)) {
    throw new Error(result.message);
  }

  console.group("Status");
  console.log(`${status}`);
  console.groupEnd();

  return result;
};

const showAboutDoc = async (
  opts: {
    docPath?: string;
    settings: Earthstar.SharedSettings;
    replica: Earthstar.Replica;
  },
) => {
  const { replica, settings, docPath = "about" } = opts;
  const _docPath = `${ABOUT_FOLDER}~${settings.author?.address}/${docPath}`;
  const result = await replica.getLatestDocAtPath(_docPath);

  if (Earthstar.isErr(result)) {
    throw new Error(result.message);
  }

  console.group(docPath);
  if (result) {
    const table: Table = new Table(
      [new Date(result?.timestamp / 1000).toLocaleString(LOCALE), result?.text],
    );
    console.log(table.toString());
  } else {
    console.log("Document not found.");
  }
  console.groupEnd();

  return result;
};

export const showPlan = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  return await showAboutDoc({ docPath: "plan", ...opts });
};

export const showProject = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  return await showAboutDoc({ docPath: "project", ...opts });
};

export const showStatus = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  return await showAboutDoc({ docPath: "status", ...opts });
};
