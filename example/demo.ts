import { foo } from "./lib1.js";
import { A } from "./lib2.js";

let inc = (n: number) => {
  return (v: number) => {
    return v;
  };
};

foo();

console.log(inc(new A().v)(2)); // 3
