import { A } from "./lib.js";

let inc = (n: A) => {
  return (v: number) => {
    return v;
  };
};

console.log(inc(1)(2)); // 3
