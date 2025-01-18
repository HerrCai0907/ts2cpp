import { Source, SourceLoader } from "../source_loader";
import * as CodeEmitter from "../code_emitter";
import { DeclarationExtractor } from "../declaration_extractor";
import { describe, test, expect } from "vitest";

function transpilerFunctionDeclaration(code: string) {
  const loader = new SourceLoader();
  loader.loadSource(new Source("demo.ts", code));
  let output: string[] = [];
  loader.forEachSource((sourceFile) => {
    let extractor = new DeclarationExtractor(loader.typeChecker);
    extractor.run(sourceFile);
    extractor.funcs.forEach((func) => {
      func.name;
      CodeEmitter.emitFunctionDeclaration(func, { write: (m) => output.push(m) });
    });
  });
  return output.join("\n");
}

describe("basic function", () => {
  test("function declaration", () => {
    expect(transpilerFunctionDeclaration("function start() {}")).toMatchInlineSnapshot(`"auto ts_start() -> ts_void;"`);
    expect(transpilerFunctionDeclaration("function add(a:i32, b:i32): i32 {}")).toMatchInlineSnapshot(
      `"auto ts_add(ts_i32 ts_a, ts_i32 ts_b) -> ts_i32;"`
    );
  });
});
