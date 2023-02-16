import { assertSnapshot, describe, it } from "../../dev_deps.ts";
import { runCommand } from "./utils.ts";

describe({
  name: "command integration",
  ignore: Deno.build.os === "windows",
  fn() {
    it("should output short help with -h flag", async (t) => {
      const output: string = await runCommand("-h");
      await assertSnapshot(t, output);
    });

    it("should output long help with --help flag", async (t) => {
      const output: string = await runCommand("--help");
      await assertSnapshot(t, output);
    });

    it("should output short version with -V flag", async (t) => {
      const output: string = await runCommand("-V");
      await assertSnapshot(t, output);
    });

    it("should output long version with --version flag", async (t) => {
      const output: string = await runCommand("--version");
      await assertSnapshot(t, output);
    });

    it("should print the help of sub-command on validation error", async (t) => {
      const output: string = await runCommand("bar", true);
      await assertSnapshot(t, output);
    });

    it("should print error message for unknown option with suggestion", async (t) => {
      const output: string = await runCommand("--colorr", true);
      await assertSnapshot(t, output);
    });

    it("should print help and error message when validation error is thrown", async (t) => {
      const output: string = await runCommand("validation-error", true);
      await assertSnapshot(t, output);
    });
  },
});
