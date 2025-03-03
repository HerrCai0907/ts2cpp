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
    struct ts_A : public builtin::GcObject {
      ts_number ts_a{};
      ts_number const& _ts_get_a() const noexcept { return this->ts_a; }
      void _ts_set_a(ts_number v) noexcept { this->ts_a = v; }
      builtin::ts_type_t<ts_string> ts_b{};
      builtin::ts_type_t<ts_string> const& _ts_get_b() const noexcept { return this->ts_b; }
      void _ts_set_b(builtin::ts_type_t<ts_string> v) noexcept { this->ts_b = v; }
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);
  expect(transpilerClassDeclaration(`class A { foo () {} }`)).toMatchInlineSnapshot(`
    "
    struct ts_A : public builtin::GcObject {
      auto ts_foo() -> ts_void;
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);
  expect(transpilerClassDeclaration(`class A { foo () { return 1; } }`)).toMatchInlineSnapshot(`
    "
    struct ts_A : public builtin::GcObject {
      auto ts_foo() -> ts_number;
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);
});
test("class with init expr", () => {
  const code = `class A { a: number = 10; }`;
  expect(transpilerClassDeclaration(code)).toMatchInlineSnapshot(`
    "
    struct ts_A : public builtin::GcObject {
      ts_number ts_a{};
      ts_number const& _ts_get_a() const noexcept { return this->ts_a; }
      void _ts_set_a(ts_number v) noexcept { this->ts_a = v; }
      ts_A();
      void ts_builtin_gc_visit_all_children() const override;
    };
    "
  `);
  expect(transpilerClassDefinition(code)).toMatchInlineSnapshot(`
    "
    ts_A::ts_A() : ts_a{10} {}
    void ts_A::ts_builtin_gc_visit_all_children() const {
      builtin::gc_visit(this->ts_a);
    }
    "
  `);
});

test("class definition", () => {
  expect(transpilerClassDefinition(`class A { a: number, b: string, }`)).toMatchInlineSnapshot(`
    "
    void ts_A::ts_builtin_gc_visit_all_children() const {
      builtin::gc_visit(this->ts_a);
      builtin::gc_visit(this->ts_b);
    }
    "
  `);
  expect(transpilerClassDefinition(`class A { foo () {} }`)).toMatchInlineSnapshot(`
    "
    auto ts_A::ts_foo() -> ts_void {
      builtin::StackManager ts_builtin_stack_manager{};
      {
      }
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
    auto ts_A::ts_foo() -> ts_number {
      builtin::StackManager ts_builtin_stack_manager{};
      {
        return builtin::store_return(ts_builtin_stack_manager, 1);
      }
    }
    auto ts_A::ts_bar(ts_number ts_a, ts_number ts_b) -> ts_number {
      builtin::StackManager ts_builtin_stack_manager{};
      {
        return builtin::store_return(ts_builtin_stack_manager, builtin::binary_operator_plus(ts_a, ts_b));
      }
    }
    void ts_A::ts_builtin_gc_visit_all_children() const {
    }
    "
  `);
});
