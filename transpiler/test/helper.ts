import { DeclarationExtractor } from "../declaration_extractor.js";
import { CodeEmitConfig } from "../emitter/config.js";
import { Source, SourceLoader } from "../source_loader.js";
import * as CodeEmitter from "../emitter";

function transpiler(
  code: string,
  libs: Source[] | undefined,
  fn: (extractor: DeclarationExtractor, config: CodeEmitConfig) => void,
): string {
  const loader = new SourceLoader();
  libs?.forEach((lib) => loader.loadSource(lib));
  loader.loadSource(new Source("demo.ts", code));
  let output: string[] = [];
  let extractor = new DeclarationExtractor();
  const source = loader.getSource("demo.ts")!;
  extractor.run(source);
  fn(extractor, new CodeEmitConfig((m) => output.push(m), source, loader.typeChecker));
  return "\n" + output.join("\n") + "\n";
}

export function transpilerGlobalDefinition(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.globals.forEach((func) => {
      CodeEmitter.emitGlobalDefinition(func, config);
    });
  });
}
export function transpilerFunctionDeclaration(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDeclaration(func, config);
    });
  });
}
export function transpilerFunctionDefinition(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.funcs.forEach((func) => {
      CodeEmitter.emitFunctionDefinition(func, config);
    });
  });
}
export function transpilerClassPreDeclaration(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassPreDeclaration(record, config);
    });
  });
}
export function transpilerClassDeclaration(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassDeclaration(record, config);
    });
  });
}
export function transpilerClassDefinition(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    extractor.records.forEach((record) => {
      CodeEmitter.emitClassDefinition(record, config);
    });
  });
}
export function transpilerGlobalInit(code: string, libs?: Source[]) {
  return transpiler(code, libs, (extractor, config) => {
    CodeEmitter.emitGlobalInit(extractor.init, config);
  });
}
