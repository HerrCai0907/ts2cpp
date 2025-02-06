import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import assert from "assert";
import { CannotResolveSymbol } from "../error.js";

export function generateTypeByNode(node: ts.Node, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  const symbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  const type = typeChecker.getTypeOfSymbol(symbol);
  return generateTypeByType(type, config);
}

export function generateTypeByTypeNode(node: ts.Node, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  const symbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  return generateType(symbol.name);
}

export function generateTypeByType(type: ts.Type, config: CodeEmitConfig): string {
  assert(!type.isLiteral());
  return generateType(config.typeChecker.typeToString(type));
}

function generateType(t: string): string {
  return `ts_${t}`;
}
