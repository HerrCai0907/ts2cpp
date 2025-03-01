import { test, expect } from "vitest";
import { transpilerClassDeclaration, transpilerClassDefinition, transpilerClassPreDeclaration } from "./helper";

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
      struct ts_A : public ts_builtin::GcObject {
        ts_builtin::ts_type_t<ts_number> ts_a{};
        ts_builtin::ts_type_t<ts_number> const& _ts_get_a() const noexcept { return this->ts_a; }
        void _ts_set_a(ts_builtin::ts_type_t<ts_number> v) noexcept { this->ts_a = v; }
        ts_builtin::ts_type_t<ts_string> ts_b{};
        ts_builtin::ts_type_t<ts_string> const& _ts_get_b() const noexcept { return this->ts_b; }
        void _ts_set_b(ts_builtin::ts_type_t<ts_string> v) noexcept { this->ts_b = v; }
        void ts_builtin_gc_visit_all_children() const override;
      };
      "
    `);
  expect(transpilerClassDeclaration(`class A { foo () {} }`)).toMatchInlineSnapshot(`
      "
      struct ts_A : public ts_builtin::GcObject {
        auto ts_foo() -> ts_builtin::ts_type_t<ts_void>;
        void ts_builtin_gc_visit_all_children() const override;
      };
      "
    `);
  expect(transpilerClassDeclaration(`class A { foo () { return 1; } }`)).toMatchInlineSnapshot(`
      "
      struct ts_A : public ts_builtin::GcObject {
        auto ts_foo() -> ts_builtin::ts_type_t<ts_number>;
        void ts_builtin_gc_visit_all_children() const override;
      };
      "
    `);
});
test("class declaration with init expr", () => {
  expect(transpilerClassDeclaration(`class A { a: number = 10; }`)).toMatchInlineSnapshot(`
      "
      struct ts_A : public ts_builtin::GcObject {
        ts_builtin::ts_type_t<ts_number> ts_a{10};
        ts_builtin::ts_type_t<ts_number> const& _ts_get_a() const noexcept { return this->ts_a; }
        void _ts_set_a(ts_builtin::ts_type_t<ts_number> v) noexcept { this->ts_a = v; }
        void ts_builtin_gc_visit_all_children() const override;
      };
      "
    `);
});

test("class definition", () => {
  expect(transpilerClassDefinition(`class A { a: number, b: string, }`)).toMatchInlineSnapshot(`
      "
      void ts_A::ts_builtin_gc_visit_all_children() const {
        ts_builtin::gc_visit(this->ts_a);
        ts_builtin::gc_visit(this->ts_b);
      }
      "
    `);
  expect(transpilerClassDefinition(`class A { foo () {} }`)).toMatchInlineSnapshot(`
      "
      auto ts_A::ts_foo() -> ts_builtin::ts_type_t<ts_void> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
      }
      void ts_A::ts_builtin_gc_visit_all_children() const {
      }
      "
    `);
  expect(
    transpilerClassDefinition(`
      class A {
        foo() { return 1; }
        bar(a: number, b: number) { return a + b; }
      }
      `),
  ).toMatchInlineSnapshot(`
      "
      auto ts_A::ts_foo() -> ts_builtin::ts_type_t<ts_number> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        return ts_builtin::store_return(ts_builtin_stack_manager, 1);
      }
      auto ts_A::ts_bar(ts_builtin::ts_type_t<ts_number> ts_a, ts_builtin::ts_type_t<ts_number> ts_b) -> ts_builtin::ts_type_t<ts_number> {
        ts_builtin::StackManager ts_builtin_stack_manager{};
        return ts_builtin::store_return(ts_builtin_stack_manager, ts_builtin::binary_operator_plus(ts_a, ts_b));
      }
      void ts_A::ts_builtin_gc_visit_all_children() const {
      }
      "
    `);
});
