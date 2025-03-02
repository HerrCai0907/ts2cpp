import { test, expect } from "vitest";
import { transpilerGlobalDefinition, transpilerGlobalInit } from "./helper";
import { Source } from "../source_loader";

test("import class", () => {
  const code = `
    import { A } from "./lib.js";
    let a : A
  `;
  const lib = new Source("lib.ts", "export class A {}");
  expect(transpilerGlobalDefinition(code, [lib])).toMatchInlineSnapshot(
    `
    "
    static builtin::ts_type_t<ts::lib::ts_A> ts_a{};
    "
  `,
  );
});

test("import function", () => {
  const code = `
    import { foo } from "./lib.js";
    foo();
  `;
  const lib = new Source("lib.ts", "export function foo() {}");
  expect(transpilerGlobalInit(code, [lib])).toMatchInlineSnapshot(
    `
    "
    void _ts_init() {
      ts::lib::ts_foo();
    }
    "
  `,
  );
});
