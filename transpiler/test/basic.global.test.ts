import { describe, test, expect } from "vitest";
import { transpilerGlobalDefinition } from "./helper";

describe("basic global", () => {
  test("global variant", () => {
    expect(transpilerGlobalDefinition(`let a = 1;`)).toMatchInlineSnapshot(
      `
      "
      static ts_number ts_a{};
      "
    `
    );
  });
});
