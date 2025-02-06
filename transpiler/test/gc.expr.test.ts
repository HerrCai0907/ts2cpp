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
      auto ts_f() -> ts_A {
        ts_builtin::StackManagerRaii raii{};
        return ts_builtin::create_object(new ts_A());;
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
      auto ts_f() -> ts_A {
        ts_builtin::StackManagerRaii raii{};
        return ts_builtin::create_object(new ts_A(1,2,3));;
      }
      "
    `);
  });
});
