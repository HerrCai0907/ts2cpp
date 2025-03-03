import { ts } from "@ts-morph/bootstrap";
import { join, relative } from "path";
import { generatedSymbolPrefix } from "./builtin/runtime.js";
import { CodeEmitConfig } from "./config.js";
import { CannotResolveSymbol } from "../error.js";
import assert from "assert";

function convertPathToNamespace(fileName: string): string {
  fileName = relative(".", fileName);
  fileName = fileName.toLowerCase();
  if (fileName.startsWith("/")) fileName = fileName.slice(1);
  if (fileName.endsWith(".ts") || fileName.endsWith(".js")) fileName = fileName.slice(0, -3);
  fileName = fileName.replaceAll("/", "::");
  fileName = fileName.replaceAll("..", `${generatedSymbolPrefix}_supper`);
  return "ts::" + fileName;
}

export function convertToNamespace(sourceFile: ts.SourceFile): string {
  return convertPathToNamespace(sourceFile.fileName);
}

export function getNamespaceForType(type: ts.Type, config: CodeEmitConfig): string {
  const symbol = type.getSymbol();
  if (symbol == undefined) return ""; // Built-in type
  const declarations = symbol.getDeclarations();
  if (!declarations) return "";
  for (let declaration of declarations) {
    if (declaration.getSourceFile() != config.sourceFile) {
      return convertToNamespace(declaration.getSourceFile()) + "::";
    }
  }
  return "";
}

export function getNamespaceForIdentifier(node: ts.Identifier, config: CodeEmitConfig): string {
  const symbol = config.typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  const declarations = symbol.getDeclarations();
  if (!declarations) return "";
  for (let declaration of declarations) {
    if (ts.isImportSpecifier(declaration)) {
      const importDeclaration = declaration.parent.parent.parent;
      assert(ts.isImportDeclaration(importDeclaration));
      assert(ts.isStringLiteral(importDeclaration.moduleSpecifier));
      const path = join(config.sourceFile.fileName, "..", importDeclaration.moduleSpecifier.text);
      return convertPathToNamespace(path) + "::";
    }
  }
  return "";
}
