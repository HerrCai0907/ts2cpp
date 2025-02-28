import { describe, test, expect } from "vitest";
import { transpilerFunctionDefinition } from "./helper";

describe("new expression", () => {
  test("without parameters", () => {
    expect(
      transpilerFunctionDefinition(`
        class A {}
        function f() { return new A(); }
    `)
    ).toMatchInlineSnapshot(`
      "
      auto ts_f() -> ts_builtin::ts_type_t<ts_A> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        return ts_builtin::store_return(ts_builtin_stack_manager, new ts_A());
      }
      "
    `);
  });
  test("with parameters", () => {
    expect(
      transpilerFunctionDefinition(`
        class A {}
        function f() { return new A(1,2,3); }
    `)
    ).toMatchInlineSnapshot(`
      "
      auto ts_f() -> ts_builtin::ts_type_t<ts_A> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        return ts_builtin::store_return(ts_builtin_stack_manager, new ts_A(1,2,3));
      }
      "
    `);
  });
});
