import { DeclarationExtractor } from "../declaration_extractor.js";
import { CodeEmitConfig } from "../emitter/config.js";
import { Source, SourceLoader } from "../source_loader.js";
import * as CodeEmitter from "../emitter";

function transpiler(code: string, fn: (extractor: DeclarationExtractor, config: CodeEmitConfig) => void): string {
  const loader = new SourceLoader();
  loader.loadSource(new Source("demo.ts", code));
  let config: CodeEmitConfig = {
    write: (m) => output.push(m),
    typeChecker: loader.typeChecker,
  };
  let output: string[] = [];
  loader.forEachSource((sourceFile) => {
    let extractor = new DeclarationExtractor();
    extractor.run(sourceFile);
    fn(extractor, config);
  });
  return "\n" + output.join("\n") + "\n";
}
export function transpilerGlobalDefinition(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.globals.forEach((func) => {
      CodeEmitter.emitGlobalDefinition(func, config);
    });
  });
}
export function transpilerFunctionDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDeclaration(func, config);
    });
  });
}
export function transpilerFunctionDefinition(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDefinition(func, config);
    });
  });
}
export function transpilerClassPreDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassPreDeclaration(record, config);
    });
  });
}
export function transpilerClassDeclaration(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassDeclaration(record, config);
    });
  });
}
export function transpilerClassDefinition(code: string) {
  return transpiler(code, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassDefinition(record, config);
    });
  });
}
export function transpilerGlobalInit(code: string) {
  return transpiler(code, (extractor, config) => {
    CodeEmitter.emitGlobalInit(extractor.init, config);
  });
}
