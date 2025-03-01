import { describe, test, expect } from "vitest";
import { transpilerFunctionDeclaration, transpilerFunctionDefinition } from "./helper";

describe("basic function", () => {
  test("function declaration", () => {
    expect(transpilerFunctionDeclaration("function start() {}")).toMatchInlineSnapshot(`
      "
      auto ts_start() -> ts_void;
      "
    `);
    expect(transpilerFunctionDeclaration("function add(a:number, b:number): number {}")).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number;
      "
    `
    );
  });
  test("function definition", () => {
    expect(transpilerFunctionDefinition("function start() { return; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_void {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          return;
        }
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() : number { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          return ts_builtin::store_return(ts_builtin_stack_manager, 0);
        }
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          return ts_builtin::store_return(ts_builtin_stack_manager, 0);
        }
      }
      "
    `
    );
    expect(transpilerFunctionDefinition(`function add(a:number, b:number) { return a + b; }`)).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_plus(ts_a, ts_b));
        }
      }
      "
    `
    );
  });
});
