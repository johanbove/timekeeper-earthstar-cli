import { assert, assertEquals } from "../../test/asserts.ts";
import * as journal from "./index.ts";
import { Earthstar } from "../../deps.ts";
import { makeReplica } from "../../test/test_utils.ts";

// Use this namespace to not mess with the app's actual settings
const NAMESPACE = "TESTING";

Deno.test("journal", async (t) => {
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

  const expected = "Working on Earthstar Project";

  await t.step({
    name: "Add journal entry",
    fn: async () => {
      const result = await journal.add({
        settings,
        replica,
        text: expected,
      });
      assert(Earthstar.notErr(result));
    },
  });

  await t.step({
    name: "Check journal",
    fn: async () => {
      const result = await journal.check({
        replica,
      });
      assert(Earthstar.notErr(result));
    },
  });

  await t.step({
    name: "List journal",
    fn: async () => {
      const result = await journal.list({
        settings,
        replica,
      });
      assert(Earthstar.notErr(result));
    },
  });

  // Close the replica or the test run won't end
  await replica.close(true);
});
