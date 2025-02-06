import { Source, SourceLoader } from "../source_loader";
import * as CodeEmitter from "../emitter";
import { DeclarationExtractor } from "../declaration_extractor";
import { describe, test, expect } from "vitest";
import { CodeEmitConfig } from "../emitter/config";

function transpiler(code: string, fn: (extractor: DeclarationExtractor, config: CodeEmitConfig) => void): string {
  const loader = new SourceLoader();
  loader.loadSource(new Source("demo.ts", code));
  let config: CodeEmitConfig = { write: (m) => output.push(m), typeChecker: loader.typeChecker };
  let output: string[] = [];
  loader.forEachSource((sourceFile) => {
    let extractor = new DeclarationExtractor();
    extractor.run(sourceFile);
    fn(extractor, config);
  });
  return "\n" + output.join("\n") + "\n";
}

function transpilerFunctionDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDeclaration(func, config);
    });
  });
}

function transpilerFunctionDefinition(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDefinition(func, config);
    });
  });
}

function transpilerClassPreDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassPreDeclaration(record, config);
    });
  });
}

function transpilerClassDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassDeclaration(record, config);
    });
  });
}

describe("basic function", () => {
  test("function declaration", () => {
    expect(transpilerFunctionDeclaration("function start() {}")).toMatchInlineSnapshot(`
      "
      auto ts_start() -> ts_void;
      "
    `);
    expect(transpilerFunctionDeclaration("function add(a:number, b:number): number {}")).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number;
      "
    `
    );
  });
  test("function definition", () => {
    expect(transpilerFunctionDefinition("function start() { return; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_void {
        return;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() : number { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        return 0;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition("function start() { return 0; }")).toMatchInlineSnapshot(
      `
      "
      auto ts_start() -> ts_number {
        return 0;
      }
      "
    `
    );
    expect(transpilerFunctionDefinition(`function add(a:number, b:number) { return a + b; }`)).toMatchInlineSnapshot(
      `
      "
      auto ts_add(ts_number ts_a, ts_number ts_b) -> ts_number {
        return ts_a + ts_b;
      }
      "
    `
    );
  });
});

describe("basic class", () => {
  test("class pre definition", () => {
    expect(transpilerClassPreDeclaration("class A {}")).toMatchInlineSnapshot(`
      "
      struct ts_A;
      "
    `);
  });

  test("class definition", () => {
    expect(transpilerClassDeclaration(`class A { a: number, b: string, }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        ts_number ts_a;
        ts_string ts_b;
      };
      "
    `);
    expect(transpilerClassDeclaration(`class A { foo () {} }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        auto ts_foo() -> ts_void;
      };
      "
    `);
    expect(transpilerClassDeclaration(`class A { foo () { return 1; } }`)).toMatchInlineSnapshot(`
      "
      struct ts_A {
        auto ts_foo() -> ts_number;
      };
      "
    `);
  });
});
