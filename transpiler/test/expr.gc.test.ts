import { describe, test, expect } from "vitest";
import { transpilerFunctionDefinition } from "./helper";

describe("new expression", () => {
  test("without parameters", () => {
    expect(
      transpilerFunctionDefinition(`
        class A {}
        function f() { return new A(); }
    `),
    ).toMatchInlineSnapshot(`
      "
      auto ts_f() -> builtin::ts_type_t<ts_A> {
        builtin::StackManager ts_builtin_stack_manager{};
        {
          return builtin::store_return(ts_builtin_stack_manager, builtin::gc_create_object<builtin::ts_type_t<ts_A>>());
        }
      }
      "
    `);
  });
  test("with parameters", () => {
    expect(
      transpilerFunctionDefinition(`
        class A {}
        function f() { return new A(1,2,3); }
    `),
    ).toMatchInlineSnapshot(`
      "
      auto ts_f() -> builtin::ts_type_t<ts_A> {
        builtin::StackManager ts_builtin_stack_manager{};
        {
          return builtin::store_return(ts_builtin_stack_manager, builtin::gc_create_object<builtin::ts_type_t<ts_A>>(1,2,3));
        }
      }
      "
    `);
  });
});
