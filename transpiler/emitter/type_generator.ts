import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";

export function generateType(type: ts.Type, config: CodeEmitConfig): string {
  return `ts_${config.typeChecker.typeToString(type)}`;
}
