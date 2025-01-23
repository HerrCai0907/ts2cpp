import { Source, SourceLoader } from "./source_loader.js";
import { DeclarationExtractor } from "./declaration_extractor.js";
import * as CodeEmitter from "./code_emitter.js";
import chalk from "chalk";

const loader = new SourceLoader();

const sources = [
  new Source(
    "src/index.ts",
    `
    function _start() {}
    `
  ),
];

for (let source of sources) {
  loader.loadSource(source);
}

loader.forEachSource((sourceFile) => {
  let extractor = new DeclarationExtractor(loader.typeChecker);
  console.log(sourceFile.fileName);
  extractor.run(sourceFile);
  extractor.funcs.forEach((func) => {
    func.name;
    CodeEmitter.emitFunctionDeclaration(func, { write: (m) => console.log(chalk.blue(m)) });
  });
});
