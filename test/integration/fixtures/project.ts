import { Timekeeper } from "../../../timekeeper.ts";

export const tests = import.meta.main ? null : {
  "should output the project": 'testing',
};

if (import.meta.main) {
  await Select.prompt({
    message: "Select an option",
    options: [
      { name: "Foo", value: "foo" },
      { name: "Bar", value: "bar" },
      { name: "Baz", value: "baz" },
    ],
  });
}