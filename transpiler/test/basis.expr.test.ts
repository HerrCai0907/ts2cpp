import { describe, test, expect } from "vitest";
import { transpilerClassDefinition, transpilerFunctionDefinition } from "./helper";

describe("basic expression", () => {
  describe("binary expression", () => {
    test("normal operator", () => {
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a + b;
          }
      `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_plus(ts_a, ts_b));
          }
        }
        "
      `);

      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a - b;
          }
      `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_minus(ts_a, ts_b));
          }
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
      `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_boolean> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_exclamation_equals_equals(ts_a, ts_b));
          }
        }
        "
      `);
      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a === b;
          }
    `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_boolean> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_equals_equals_equals(ts_a, ts_b));
          }
        }
        "
      `);

      expect(
        transpilerFunctionDefinition(`
          function f(a:number, b:number) {
            return a ?? b;
          }
    `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_question_question(ts_a, ts_b));
          }
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
    `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_never> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            return ts_builtin::store_return(ts_builtin_stack_manager, ts_f(ts_a, ts_b));
          }
        }
        "
      `);
    });
  });

  describe("property access expression", () => {
    test("get", () => {
      expect(
        transpilerFunctionDefinition(`
          class A { v: number; }
          function f(a: A) {
            a.v;
          }
    `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_A> ts_a) -> ts_builtin::ts_type_t<ts_void> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            ts_a->_ts_get_v();
          }
        }
        "
      `);
    });
    test("set", () => {
      expect(
        transpilerFunctionDefinition(`
          class A { v: number; }
          function f(a: A) {
            a.v = 1;
          }
    `),
      ).toMatchInlineSnapshot(`
        "
        auto ts_f(ts_builtin::ts_type_t<ts_A> ts_a) -> ts_builtin::ts_type_t<ts_void> {
          ts_builtin::StackManager ts_builtin_stack_manager{};
          {
            ts_a->_ts_set_v(1);
          }
        }
        "
      `);
    });
  });

  test("method call", () => {
    expect(
      transpilerFunctionDefinition(`
        class A { foo() {} }
        function f(a: A) {
          a.foo();
        }
  `),
    ).toMatchInlineSnapshot(`
      "
      auto ts_f(ts_builtin::ts_type_t<ts_A> ts_a) -> ts_builtin::ts_type_t<ts_void> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          ts_a->ts_foo();
        }
      }
      "
    `);
  });

  test("this expr", () => {
    expect(
      transpilerClassDefinition(`
        class A { f() { return this; } }
  `),
    ).toMatchInlineSnapshot(`
      "
      auto ts_A::ts_f() -> ts_builtin::ts_type_t<ts_this> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        {
          return ts_builtin::store_return(ts_builtin_stack_manager, this);
        }
      }
      void ts_A::ts_builtin_gc_visit_all_children() const {
      }
      "
    `);
  });
});
