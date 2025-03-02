import { A } from "./lib2.js";

export function one() {
  return 1;
}

export function foo(): A {
  return new A();
}
