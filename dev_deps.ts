// Inspired by https://github.com/c4spar/deno-cliffy/blob/main/dev_deps.ts
export { dirname } from "https://deno.land/std@0.170.0/path/mod.ts";
// Testing
export {
  assert,
  assertEquals,
  assertInstanceOf,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";
export {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.170.0/testing/mock.ts";
export { assertSnapshot } from "https://deno.land/std@0.170.0/testing/snapshot.ts";
export { describe, it } from "https://deno.land/std@0.170.0/testing/bdd.ts";
export { expandGlob } from "https://deno.land/std@0.170.0/fs/mod.ts";
export type { WalkEntry } from "https://deno.land/std@0.170.0/fs/mod.ts";

/* 3rd party */
export { gt, lt } from "https://deno.land/x/semver@v1.4.1/mod.ts";
export { default as sinon } from "https://cdn.skypack.dev/sinon@v13.0.2?dts";
