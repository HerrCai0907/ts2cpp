import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";

export function generateIdentifier(node: ts.Identifier, _: CodeEmitConfig): string {
  return `ts_${node.getText()}`;
}
