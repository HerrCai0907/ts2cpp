import { test, expect } from "vitest";
import { transpilerGlobalInit } from "./helper";

test("empty", () => {
  const code = `let fn = () => {};`;
  expect(transpilerGlobalInit(code)).toMatchInlineSnapshot(`
    "
    void _ts_init() {
      ts_fn = builtin::create_object<builtin::ts_func_t<ts_void>>([] () -> ts_void {
      builtin::StackManager ts_builtin_stack_manager{};
        {
        }
      });
    }
    "
  `);
});

test("empty", () => {
  const code = `let fn = () => 1;`;
  expect(transpilerGlobalInit(code)).toMatchInlineSnapshot(`
    "
    void _ts_init() {
      ts_fn = builtin::create_object<builtin::ts_func_t<ts_number>>([] () -> ts_number {
        return 1;
      });
    }
    "
  `);
});
