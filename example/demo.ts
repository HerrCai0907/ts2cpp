let a = 100;
a = 1;

class A {
  a: number = 10;
  b: A;

  foo() {
    return this.a + this.b.a;
  }
}

function f() {
  let a = new A();
  a.a = 1;
  a.foo();
  return a.a;
}
