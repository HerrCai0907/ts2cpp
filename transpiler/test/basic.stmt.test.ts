import { describe, test, expect } from "vitest";
import { transpilerFunctionDefinition } from "./helper";

describe("basic function", () => {
  test("declare statement", () => {
    expect(
      transpilerFunctionDefinition(`
        function add(a:number, b:number): number {
          let a = 1;
        }`)
    ).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        ts_builtin::ts_type_t<ts_number> ts_a{1};
      }
      "
    `
    );

    expect(
      transpilerFunctionDefinition(`
        class A {}
        function add(a:number, b:number): number {
          let a = new A();
        }`)
    ).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        ts_builtin::ts_type_t<ts_A> ts_a{ts_builtin::create_object(new ts_A())};
      }
      "
    `
    );
  });
});
