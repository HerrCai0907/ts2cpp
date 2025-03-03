import { test, expect } from "vitest";
import { transpilerGlobalDefinition, transpilerGlobalInit } from "./helper";

test("nullable class", () => {
  const code = `
  class A {}
  let v: A | null = null;`;
  expect(transpilerGlobalDefinition(code)).toMatchInlineSnapshot(`
    "
    static builtin::union_type_t<builtin::ts_type_t<ts_null>,builtin::ts_type_t<ts_A>> ts_v{};
    "
  `);
  expect(transpilerGlobalInit(code)).toMatchInlineSnapshot(`
    "
    void _ts_init() {
      ts_v = nullptr;
    }
    "
  `);
});
