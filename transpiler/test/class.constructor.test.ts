import { test, expect } from "vitest";
import { transpilerClassDeclaration, transpilerClassDefinition } from "./helper";

test("without parameters", () => {
  const code = "class A { constructor() {} }";
  expect(transpilerClassDeclaration(code)).toMatchInlineSnapshot(`
    "
    struct ts_A : public ts_builtin::GcObject {
      explicit ts_A();
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);

  expect(transpilerClassDefinition(code)).toMatchInlineSnapshot(`
    "
    ts_A::ts_A() {
      ts_builtin::StackManager ts_builtin_stack_manager{};
    }
    void ts_A::ts_builtin_gc_visit_all_children() const {
    }
    "
  `);
});

test("with parameters", () => {
  const code = "class A { constructor(v: number) {} }";
  expect(transpilerClassDeclaration(code)).toMatchInlineSnapshot(`
    "
    struct ts_A : public ts_builtin::GcObject {
      explicit ts_A(ts_builtin::ts_type_t<ts_number> ts_v);
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);

  expect(transpilerClassDefinition(code)).toMatchInlineSnapshot(`
    "
    ts_A::ts_A(ts_builtin::ts_type_t<ts_number> ts_v) {
      ts_builtin::StackManager ts_builtin_stack_manager{};
    }
    void ts_A::ts_builtin_gc_visit_all_children() const {
    }
    "
  `);
});
