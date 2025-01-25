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

function transpilerFunctionDefinition(code: string) {
  const loader = new SourceLoader();
  loader.loadSource(new Source("demo.ts", code));
  let output: string[] = [];
  loader.forEachSource((sourceFile) => {
    let extractor = new DeclarationExtractor(loader.typeChecker);
    extractor.run(sourceFile);
    extractor.funcs.forEach((func) => {
      func.name;
      CodeEmitter.emitFunctionDefinition(func, { write: (m) => output.push(m) });
    });
  });
  return output.join("\n");
}

describe("basic function", () => {
  test("function declaration", () => {
    expect(transpilerFunctionDeclaration("function start() {}")).toMatchInlineSnapshot(`"auto ts_start() -> ts_void;"`);
    expect(transpilerFunctionDeclaration("function add(a:number, b:number): number {}")).toMatchInlineSnapshot(
      `"auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number;"`
    );
  });
  test("function definition", () => {
    expect(transpilerFunctionDefinition("function start() { return; }")).toMatchInlineSnapshot(
      `
      "auto ts_start() -> ts_void {
      return;
      }"
    `
    );
    expect(transpilerFunctionDefinition("function start() : number { return 0; }")).toMatchInlineSnapshot(
      `
      "auto ts_start() -> ts_number {
      return 0;
      }"
    `
    );
    expect(transpilerFunctionDefinition("function start() { return 0; }")).toMatchInlineSnapshot(
      `
      "auto ts_start() -> ts_number {
      return 0;
      }"
    `
    );
    expect(transpilerFunctionDefinition(`function add(a:number, b:number) { return a + b; }`)).toMatchInlineSnapshot(
      `
      "auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number {
      return ts_a + ts_b;
      }"
    `
    );
  });
});
