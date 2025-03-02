import { ts } from "@ts-morph/bootstrap";
import { DeclarationExtractor } from "./declaration_extractor.js";
import { CodeEmitConfig } from "./emitter/config.js";
import { SourceLoader } from "./source_loader.js";
import * as CodeEmitter from "./emitter/index.js";
import { writeFileSync } from "node:fs";
import { indent } from "./emitter/indent.js";
import { generatedSymbolPrefix } from "./emitter/builtin/runtime.js";

const loader = new SourceLoader();
loader.loadConfig("example/tsconfig.json");

let output: string[] = [
  `#include "rt/console.hpp"`,
  `#include "rt/function.hpp"`,
  `#include "rt/gc.hpp"`,
  `#include "rt/operator.hpp"`,
  `#include "rt/type.hpp"`,
];

loader.forEachSource((s) => console.log(s.fileName));

const w = (m: string) => output.push(m);

loader.forEachSource((sourceFile: ts.SourceFile): void => {
  let extractor = new DeclarationExtractor();
  extractor.run(sourceFile);

  const ns = CodeEmitter.convertToNamespace(sourceFile);
  w(`namespace ${ns} {`);
  const config = new CodeEmitConfig(w, sourceFile, loader.typeChecker);
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
