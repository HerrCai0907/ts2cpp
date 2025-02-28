import { describe, test, expect } from "vitest";
import { transpilerFunctionDefinition } from "./helper";

describe("basic expression", () => {
  describe("binary expression", () => {
    test("normal operator", () => {
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a + b;
          }
      `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::_plus_token(ts_a, ts_b));
        }
        "
      `);

      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a - b;
          }
      `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::_minus_token(ts_a, ts_b));
        }
        "
      `);
    });

    test("ts special operator", () => {
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a !== b;
          }
      `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_boolean> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::_exclamation_equals_equals_token(ts_a, ts_b));
        }
        "
      `);
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a === b;
          }
    `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_boolean> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::_equals_equals_equals_token(ts_a, ts_b));
        }
        "
      `);

      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a ?? b;
          }
    `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::_question_question_token(ts_a, ts_b));
        }
        "
      `);
    });
  });

  describe("call expression", () => {
    test("function call", () => {
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return f(a, b);
          }
    `)
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_never> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          return ts_builtin::store_return(ts_builtin_stack_manager, ts_f(ts_a, ts_b));
        }
        "
      `);
    });
  });
});
