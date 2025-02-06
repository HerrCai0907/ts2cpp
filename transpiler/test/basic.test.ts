import { describe, test, expect } from "vitest";
import {
  transpilerClassDeclaration,
  transpilerClassDefinition,
  transpilerClassPreDeclaration,
  transpilerFunctionDeclaration,
  transpilerFunctionDefinition,
} from "./helper";

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
        ts_builtin::StackManagerRaii raii{};
        return;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() : number { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        ts_builtin::StackManagerRaii raii{};
        return 0;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        ts_builtin::StackManagerRaii raii{};
        return 0;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition(`function add(a:number, b:number) { return a + b; }`)).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number {
        ts_builtin::StackManagerRaii raii{};
        return ts_builtin::_plus_token(ts_a, ts_b);
      }
      "
    `
    );
  });
});

describe("basic class", () => {
  test("class pre definition", () => {
    expect(transpilerClassPreDeclaration("class A {}")).toMatchInlineSnapshot(`
      "
      struct ts_A;
      "
    `);
  });

  test("class declaration", () => {
    expect(transpilerClassDeclaration(`class A { a: number, b: string, }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        ts_number ts_a;
        ts_string ts_b;
      };
      "
    `);
    expect(transpilerClassDeclaration(`class A { foo () {} }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        auto ts_foo() -> ts_void;
      };
      "
    `);
    expect(transpilerClassDeclaration(`class A { foo () { return 1; } }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        auto ts_foo() -> ts_number;
      };
      "
    `);
  });

  test("class definition", () => {
    expect(transpilerClassDefinition(`class A { a: number, b: string, }`)).toMatchInlineSnapshot(`
      "

      "
    `);
    expect(transpilerClassDefinition(`class A { foo () {} }`)).toMatchInlineSnapshot(`
        "
          auto ts_A::ts_foo() -> ts_void {
            ts_builtin::StackManagerRaii raii{};
          }
        "
      `);
    expect(
      transpilerClassDefinition(`
      class A {
        foo() { return 1; }
        bar(a: number, b: number) { return a + b; }
      }
      `)
    ).toMatchInlineSnapshot(`
      "
        auto ts_A::ts_foo() -> ts_number {
          ts_builtin::StackManagerRaii raii{};
          return 1;
        }
        auto ts_A::ts_bar(ts_number ts_a, ts_number ts_b) -> ts_number {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_plus_token(ts_a, ts_b);
        }
      "
    `);
  });
});

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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_number {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_plus_token(ts_a, ts_b);
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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_number {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_minus_token(ts_a, ts_b);
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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_boolean {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_exclamation_equals_equals_token(ts_a, ts_b);
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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_boolean {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_equals_equals_equals_token(ts_a, ts_b);
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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_number {
          ts_builtin::StackManagerRaii raii{};
          return ts_builtin::_question_question_token(ts_a, ts_b);
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
        auto ts_f(ts_number ts_a, ts_number ts_b) -> ts_never {
          ts_builtin::StackManagerRaii raii{};
          return ts_f(ts_a, ts_b);
        }
        "
      `);
    });
  });
});
