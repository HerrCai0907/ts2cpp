import { Source, SourceLoader } from "./source_loader.js";
import { DeclarationExtractor } from "./declaration.js";

const loader = new SourceLoader();

const sources = [
  new Source(
    "src/index.ts",
    `
    function _start() {
    }
    `
  ),
];

for (let source of sources) {
  loader.loadSource(source);
}

let extractor = new DeclarationExtractor(loader.typeChecker);

loader.forEachSource((sourceFile) => {
  console.log(sourceFile.fileName);
  extractor.run(sourceFile);
});
