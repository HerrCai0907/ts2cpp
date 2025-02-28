let a = 100;

class A {
  a: number = 10;
  b: A;
}

function f() {
  let a = new A();
  a.a = 1;
  return a.a;
}
