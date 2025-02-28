import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";

export function generateIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `ts_${node.getText()}`;
}

export function generateGetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `ts_get_${node.getText()}`;
}

export function generateSetterIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `ts_set_${node.getText()}`;
}
