import { test, expect } from "vitest";
import { transpilerGlobalDefinition, transpilerGlobalInit } from "./helper";

test("empty", () => {
  const code = `let fn: () => void;`;
  expect(transpilerGlobalDefinition(code)).toMatchInlineSnapshot(`
    "
    static builtin::ts_func_t<ts_void> ts_fn{};
    "
  `);
});

test("parameter", () => {
  const code = `let fn: (v: number) => number;`;
  expect(transpilerGlobalDefinition(code)).toMatchInlineSnapshot(`
    "
    static builtin::ts_func_t<ts_number,ts_number> ts_fn{};
    "
  `);
});

test("nest", () => {
  const code = `let fn: (v: number) => () => number;`;
  expect(transpilerGlobalDefinition(code)).toMatchInlineSnapshot(`
    "
    static builtin::ts_func_t<builtin::ts_func_t<ts_number>,ts_number> ts_fn{};
    "
  `);
});
