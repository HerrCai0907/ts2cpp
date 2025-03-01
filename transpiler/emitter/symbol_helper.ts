import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";

export function isAccessMethod(node: ts.PropertyAccessExpression, config: CodeEmitConfig): boolean {
  const symbol: ts.Symbol | undefined = config.typeChecker.getSymbolAtLocation(node.name);
  if (!symbol) return false;
  return (symbol.flags & ts.SymbolFlags.Method) == ts.SymbolFlags.Method;
}

export function isAccessProperty(node: ts.PropertyAccessExpression, config: CodeEmitConfig): boolean {
  const symbol: ts.Symbol | undefined = config.typeChecker.getSymbolAtLocation(node.name);
  if (!symbol) return false;
  return (symbol.flags & ts.SymbolFlags.Property) == ts.SymbolFlags.Property;
}
