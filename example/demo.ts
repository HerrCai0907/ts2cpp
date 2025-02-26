class A {
  a: number = 10;
  b: A;
}

function f() {
  return new A();
}
