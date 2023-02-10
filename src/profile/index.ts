import { Earthstar, Input, Table } from "../../deps.ts";
import { ABOUT_FOLDER, LOCALE } from "../../constants.ts";

export const setDisplayName = async (
  opts: { settings: Earthstar.SharedSettings; replica: Earthstar.Replica },
) => {
  const { replica, settings } = opts;

  const displayName = await Input.prompt({
    message: "Enter a name",
  });

  if (settings.author && displayName && displayName.length) {
    const result = await replica.set(settings.author, {
      path: `${ABOUT_FOLDER}~${settings.author?.address}/displayName`,
      text: displayName,
    });

    if (Earthstar.isErr(result)) {
      console.log(result.message);
      Deno.exit(1);
    }

    console.group("DisplayName");
    console.log(`Hello ${displayName}`);
    console.groupEnd();
  }
};

export const setStatus = async (
  opts: {
    status?: string;
    settings: Earthstar.SharedSettings;
    replica: Earthstar.Replica;
  },
) => {
  const { replica, settings, status } = opts;

  let _status: string | undefined = status;

  if (!status) {
    _status = await Input.prompt({
      message: "Enter a status",
    });
  }

  if (settings.author && status && status.length) {
    const result = await replica.set(settings.author, {
      path: `${ABOUT_FOLDER}~${settings.author?.address}/status`,
      text: _status,
    });

    if (Earthstar.isErr(result)) {
      console.log(result.message);
      Deno.exit(1);
    }

    console.group("Status");
    console.log(`${status}`);
    console.groupEnd();
  }
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
    console.log(result.message);
    Deno.exit(1);
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
