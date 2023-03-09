import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "../../test/asserts.ts";
import * as profile from "./index.ts";
import { Earthstar } from "../../deps.ts";
import { makeReplica } from "../../test/test_utils.ts";

const NAMESPACE = "TESTING";

Deno.test("profile", async (t) => {
  const shareKeypair = await Earthstar.Crypto.generateShareKeypair(
    "testing",
  ) as Earthstar.ShareKeypair;
  const authorKeypair = await Earthstar.Crypto.generateAuthorKeypair(
    "test",
  ) as Earthstar.AuthorKeypair;
  const settings: Earthstar.SharedSettings = new Earthstar.SharedSettings({
    namespace: NAMESPACE,
  });

  settings.author = authorKeypair;
  settings.addShare(shareKeypair.shareAddress);
  await settings.addSecret(shareKeypair.shareAddress, shareKeypair.secret);

  assert(Earthstar.notErr(settings));

  assert(Earthstar.notErr(shareKeypair));

  const { shareAddress, secret } = shareKeypair;
  const replica = makeReplica(shareAddress, secret);

  assert(Earthstar.notErr(replica));

  assertEquals(
    typeof replica.replicaId,
    "string",
    "replica has a storageId",
  );

  const expected = "Earthstar Project";

  await t.step({
    name: "Set display name",
    fn: async () => {
      const result = await profile.setDisplayName({
        settings,
        replica,
        name: expected,
      });
      assert(Earthstar.notErr(result));
    },
  });

  await t.step({
    name: "Get display name",
    fn: async () => {
      const result = await profile.getDisplayName({ settings, replica });
      assert(Earthstar.notErr(result));
      assertEquals(result, expected);
    },
  });

  await t.step({
    name: "Set status",
    fn: async () => {
      const expected = "Testing Profile";
      const result = await profile.setStatus({
        settings,
        replica,
        status: expected,
      });
      assert(Earthstar.notErr(result));
    },
  });

  await t.step({
    name: "Show status",
    fn: async () => {
      const expected = "Testing Profile";
      const result = await profile.showStatus({ settings, replica });
      assert(Earthstar.notErr(result));
      assert(typeof result?.text, "string");
      assertStringIncludes(result?.text as string, expected);
    },
  });

  await replica.close(true);
});
