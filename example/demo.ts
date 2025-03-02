import { A, foo } from "./lib.js";

let inc = (n: A) => {
  return (v: number) => {
    return v;
  };
};

foo();

console.log(inc(new A())(2)); // 3
