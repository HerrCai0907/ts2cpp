import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import assert from "assert";

export function generateType(type: ts.Type, config: CodeEmitConfig): string {
  assert(!type.isLiteral());
  return `ts_${config.typeChecker.typeToString(type)}`;
}
