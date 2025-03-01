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

test("with default initializer", () => {
  const code = `
  class A {
    n: number = 100;
    constructor(v: number) {}
  }
  `;
  expect(transpilerClassDeclaration(code)).toMatchInlineSnapshot(`
    "
    struct ts_A : public ts_builtin::GcObject {
      ts_builtin::ts_type_t<ts_number> ts_n{};
      ts_builtin::ts_type_t<ts_number> const& _ts_get_n() const noexcept { return this->ts_n; }
      void _ts_set_n(ts_builtin::ts_type_t<ts_number> v) noexcept { this->ts_n = v; }
      explicit ts_A(ts_builtin::ts_type_t<ts_number> ts_v);
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);

  expect(transpilerClassDefinition(code)).toMatchInlineSnapshot(`
    "
    ts_A::ts_A(ts_builtin::ts_type_t<ts_number> ts_v) : ts_n{100} {
      ts_builtin::StackManager ts_builtin_stack_manager{};
    }
    void ts_A::ts_builtin_gc_visit_all_children() const {
      ts_builtin::gc_visit(this->ts_n);
    }
    "
  `);
});
