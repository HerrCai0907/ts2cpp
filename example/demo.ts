class A {
  a = 100;
}
let v: A | null | number = new A();

console.log(v.a);
v = 10;
console.log(v);
