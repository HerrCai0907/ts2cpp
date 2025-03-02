import { test, expect } from "vitest";
import { transpilerGlobalDefinition } from "./helper";
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
