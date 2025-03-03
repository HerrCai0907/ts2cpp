import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generatedSymbolPrefix } from "./builtin/runtime.js";
import { getNamespaceForIdentifier } from "./source_emitter.js";
import { generateContextualTypeByExpression, generateTypeByNode } from "./type_generator.js";

export function generateIdentifierInExpr(node: ts.Identifier, config: CodeEmitConfig): string {
  const identifier = `ts_${node.getText()}`;
  const sourceNamespace = getNamespaceForIdentifier(node, config);

  const originType = generateTypeByNode(node, undefined, config);
  const currentType = generateContextualTypeByExpression(node, config);
  if (originType != currentType) {
    return `static_cast<${currentType}>(${sourceNamespace}${identifier})`;
  }
  return `${sourceNamespace}${identifier}`;
}

export function generateIdentifier(node: ts.Identifier, config: CodeEmitConfig): string {
  const identifier = `ts_${node.getText()}`;
  const sourceNamespace = getNamespaceForIdentifier(node, config);
  return `${sourceNamespace}${identifier}`;
}

export function generateGetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `${generatedSymbolPrefix}_get_${node.getText()}`;
}

export function generateSetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `${generatedSymbolPrefix}_set_${node.getText()}`;
}
