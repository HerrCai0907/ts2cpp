let a = 100;
a = 1;

class B {
  a: number = 20;
}

class A {
  a: number = 10;
  b: B = new B();

  foo() {
    return this.a + this.b.a;
  }
}

function f() {
  let a = new A();
  a.a = 1;
  return a.foo();
}

console.log(a);
console.log(f());
