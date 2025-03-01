import { ts } from "@ts-morph/bootstrap";
import { relative } from "path";
import { generatedSymbolPrefix } from "./builtin/runtime.js";

export function convertToNamespace(sourceFile: ts.SourceFile): string {
  let fileName = sourceFile.fileName;
  fileName = relative(".", fileName);
  fileName = fileName.toLowerCase();
  if (fileName.startsWith("/")) fileName = fileName.slice(1);
  if (fileName.endsWith(".ts")) fileName = fileName.slice(0, -3);
  fileName = fileName.replaceAll("/", "::");
  fileName = fileName.replaceAll("..", `${generatedSymbolPrefix}_supper`);
  return "ts::" + fileName;
}
