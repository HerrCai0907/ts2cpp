import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generatedSymbolPrefix } from "./builtin/runtime.js";

export function generateIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `ts_${node.getText()}`;
}

export function generateGetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `${generatedSymbolPrefix}_get_${node.getText()}`;
}

export function generateSetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `${generatedSymbolPrefix}_set_${node.getText()}`;
}
