import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import assert from "assert";
import { CannotResolveSymbol, NotImplementError } from "../error.js";
import { funcTypeTemplate, typeTemplate, unionTypeTemplate } from "./builtin/type.js";
import { getNamespaceForType } from "./source_emitter.js";

export function generateTypeByNode(node: ts.Node, typeNode: ts.TypeNode | undefined, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  if (typeNode != undefined) return generateTypeByType(config.typeChecker.getTypeFromTypeNode(typeNode), config);
  const symbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  return generateTypeBySymbol(symbol, config);
}

export function generateContextualTypeByExpression(node: ts.Expression, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  const type: ts.Type = typeChecker.getTypeAtLocation(node);
  return generateTypeByType(type, config);
}

export function generateTypeBySymbol(symbol: ts.Symbol, config: CodeEmitConfig): string {
  const type = config.typeChecker.getTypeOfSymbol(symbol);
  return generateTypeByType(type, config);
}

export function generateTypeByType(type: ts.Type, config: CodeEmitConfig): string {
  assert(!type.isLiteral());
  const signatures = config.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
  if (signatures.length != 0) {
    if (signatures.length > 1) throw new NotImplementError("union type");
    const sig = signatures[0];
    const parameterTypes = sig.getParameters().map((p) => generateTypeBySymbol(p, config));
    const returnType = generateTypeByType(sig.getReturnType(), config);
    const parameters = parameterTypes.map((t) => `,${t}`).join("");
    return `${funcTypeTemplate}<${returnType}${parameters}>`;
  }
  if (type.flags & ts.TypeFlags.Boolean) {
    // FIXME
    return `${typeTemplate}<ts_boolean>`;
  }
  if (type.isUnion()) {
    const subTypes = type.types.map((t) => generateTypeByType(t, config)).join(",");
    return `${unionTypeTemplate}<${subTypes}>`;
  }
  const typeString = "ts_" + config.typeChecker.typeToString(type);
  const typeNamespace = getNamespaceForType(type, config);
  switch (typeString) {
    case "ts_void":
    case "ts_number":
      return typeString;
    default:
      return `${typeTemplate}<${typeNamespace}${typeString}>`;
  }
}
