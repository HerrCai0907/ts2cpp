import { ts } from "@ts-morph/bootstrap";
import { DeclarationExtractor } from "./declaration_extractor.js";
import { CodeEmitConfig } from "./emitter/config.js";
import { Source, SourceLoader } from "./source_loader.js";
import * as CodeEmitter from "./emitter/index.js";
import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "example/demo.ts";
const loader = new SourceLoader();
loader.loadSource(new Source(sourcePath, readFileSync(sourcePath, "utf-8")));

class Output {
  constructor(
    public filePath: string,
    public code: string,
  ) {}
}

let outputs = loader.forEachSource((sourceFile: ts.SourceFile): Output => {
  let extractor = new DeclarationExtractor();
  extractor.run(sourceFile);

  let output: string[] = [`#include "rt/gc.hpp"`, `#include "rt/type.hpp"`];

  let config: CodeEmitConfig = {
    write: (m) => output.push(m),
    typeChecker: loader.typeChecker,
  };
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassPreDeclaration(record, config);
  });

  extractor.funcs.forEach((func) => {
    CodeEmitter.emitFunctionDeclaration(func, config);
  });
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassDeclaration(record, config);
  });

  extractor.funcs.forEach((func) => {
    CodeEmitter.emitFunctionDefinition(func, config);
  });
  extractor.records.forEach((record) => {
    CodeEmitter.emitClassDefinition(record, config);
  });

  return new Output(sourceFile.fileName.replace(/\.ts$/, ".cc"), output.join("\n"));
});

outputs.forEach((o) => writeFileSync(o.filePath, o.code));
