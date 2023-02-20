// import { eraseDown } from "../../ansi/ansi_escapes.ts";
import {
  assertSnapshot,
  describe,
  // dirname,
  // expandGlob,
  it,
  // lt,
  // WalkEntry,
} from "../../dev_deps.ts";
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

    // it("should set a share address with a valid address", async (t) => {
    //   const output: string = await runCommand(
    //     "-s +test2.by4qvjvdk2xbyyqbxie4oegxsv2lbw7fwaulxlklrowmskdiekgua",
    //   );
    //   await assertSnapshot(t, output);
    // });

    it("should not allow setting a share address with an invalid address", async (t) => {
      const output: string = await runCommand("-s test", true);
      await assertSnapshot(t, output);
    });
  },
});

// type TestModule = {
//   tests?: Record<string, Array<string>>;
// };

// const baseDir = `${dirname(import.meta.url).replace("file://", "")}`;

// for await (const file: WalkEntry of expandGlob(`${baseDir}/fixtures/*.ts`)) {
//   if (file.isFile) {
//     const name = file.name.replace(/_/g, " ").replace(".ts", "");

//     Deno.test({
//       name: `prompt - integration - ${name}`,
//       ignore: lt(Deno.version.deno, "1.10.0"),
//       async fn(ctx) {
//         const testModule: TestModule = await import("file://" + file.path);
//         const tests = Object.entries(testModule.tests ?? {});

//         if (!tests.length) {
//           throw new Error(`Now tests defined for: ${file.path}`);
//         }

//         for (const [name, inputs] of tests) {
//           await ctx.step({
//             name,
//             async fn() {
//               const output: string = await runPrompt(file, inputs);
//               const os = Deno.build.os === "windows" ? ".windows" : "";
//               await assertSnapshot(ctx, output, {
//                 path: `__snapshots__/test.ts${os}.snap`,
//               });
//             },
//           });
//         }
//       },
//     });
//   }
// }

// function getCmdFlagsForFile(file: WalkEntry): string[] {
//   if (file.name === "input_no_location_flag.ts") {
//     return [
//       "--unstable",
//       "--allow-all",
//     ];
//   }
//   return [
//     "--unstable",
//     "--allow-all",
//     // "--location",
//     // "https://cliffy.io",
//   ];
// }

// async function runPrompt(
//   file: WalkEntry,
//   inputs: Array<string>,
// ): Promise<string> {
//   const flags = getCmdFlagsForFile(file);
//   const cmd = new Deno.Command("deno", {
//     stdin: "piped",
//     stdout: "piped",
//     args: [
//       "run",
//       ...flags,
//       file.path,
//     ],
//     env: {
//       NO_COLOR: "true",
//     },
//   });
//   const child: Deno.ChildProcess = cmd.spawn();
//   const writer = child.stdin.getWriter();

//   for (const input of inputs) {
//     await writer.write(new TextEncoder().encode(input));
//     // Ensure all inputs are processed and rendered separately.
//     await new Promise((resolve) => setTimeout(resolve, 300));
//   }

//   const { success, stdout } = await child.output();
//   writer.releaseLock();
//   child.stdin.close();

//   if (!success) {
//     throw new Error(`test failed: ${file}`);
//   }

//   // Add a line break after each test input.
//   return new TextDecoder().decode(stdout).replaceAll(
//     eraseDown(),
//     eraseDown() + "\n",
//   );
// }
