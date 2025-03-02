import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import assert from "assert";
import { CannotResolveSymbol, NotImplementError } from "../error.js";
import { funcTypeTemplate, typeTemplate } from "./builtin/type.js";
import { convertToNamespace } from "./source_emitter.js";

export function generateTypeByNode(node: ts.Node, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  const symbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  return generateTypeBySymbol(symbol, config);
}

export function generateTypeBySymbol(symbol: ts.Symbol, config: CodeEmitConfig): string {
  const type = config.typeChecker.getTypeOfSymbol(symbol);
  return generateTypeByType(type, config);
}

export function generateRawTypeByTypeNode(node: ts.Node, config: CodeEmitConfig): string {
  let { typeChecker } = config;
  const symbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(node);
  if (symbol == undefined) throw new CannotResolveSymbol();
  return `ts_${symbol.name}`;
}

function getNamespaceType(type: ts.Type, config: CodeEmitConfig): string {
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

  const typeString = "ts_" + config.typeChecker.typeToString(type);
  const typeNamespace = getNamespaceType(type, config);
  switch (typeString) {
    case "ts_void":
    case "ts_number":
      return typeString;
    default:
      return `${typeTemplate}<${typeNamespace}${typeString}>`;
  }
}
