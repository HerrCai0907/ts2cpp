import { ts } from "@ts-morph/bootstrap";
import { DeclarationExtractor } from "./declaration_extractor.js";
import { CodeEmitConfig } from "./emitter/config.js";
import { Source, SourceLoader } from "./source_loader.js";
import * as CodeEmitter from "./emitter/index.js";
import { readFileSync, writeFileSync } from "node:fs";
import { indent } from "./emitter/indent.js";
import { generatedSymbolPrefix } from "./emitter/builtin/runtime.js";

const sourcePath = "example/demo.ts";
const loader = new SourceLoader();
loader.loadSource(new Source(sourcePath, readFileSync(sourcePath, "utf-8")));

let output: string[] = [`#include "rt/gc.hpp"`, `#include "rt/type.hpp"`];
const w = (m: string) => output.push(m);

loader.forEachSource((sourceFile: ts.SourceFile): void => {
  let extractor = new DeclarationExtractor();
  extractor.run(sourceFile);

  const ns = CodeEmitter.convertToNamespace(sourceFile);
  w(`namespace ${ns} {`);
  const config: CodeEmitConfig = { typeChecker: loader.typeChecker, write: w };
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassPreDeclaration(record, config);
  });

  extractor.globals.forEach((global) => {
    CodeEmitter.emitGlobalDefinition(global, config);
  });
  extractor.funcs.forEach((func) => {
    CodeEmitter.emitFunctionDeclaration(func, config);
  });
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassDeclaration(record, config);
  });
  CodeEmitter.emitGlobalInit(extractor.init, config);

  extractor.funcs.forEach((func) => {
    CodeEmitter.emitFunctionDefinition(func, config);
  });
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassDefinition(record, config);
  });
  w(`} // namespace ${ns}`);
});

w(`int main() {`);
loader.forEachSource((sourceFile: ts.SourceFile): void => {
  const ns = CodeEmitter.convertToNamespace(sourceFile);
  indent(w)(`${ns}::${generatedSymbolPrefix}_init();`);
});
w(`}`);

writeFileSync("example/demo.cc", output.join("\n"));
