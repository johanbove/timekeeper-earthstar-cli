import { Earthstar, Select } from "../deps.ts";

export async function pickShare(settings: Earthstar.SharedSettings): Promise<{
  address: string;
  secret: string | undefined;
}> {
  if (settings.shares.length === 0) {
    throw "No known shares.";
  }

  const share = await Select.prompt({
    message: "Pick a share",
    options: settings.shares,
  });

  return { address: share, secret: settings.shareSecrets[share] };
}
