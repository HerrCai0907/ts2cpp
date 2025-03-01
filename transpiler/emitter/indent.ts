import { CodeEmitConfig } from "./config.js";

export function indent(write: (m: string) => void) {
  return (m: string) => write(`  ${m}`);
}

export function indentConfig(config: CodeEmitConfig): CodeEmitConfig {
  return new CodeEmitConfig(config.println, config.typeChecker, config.indentLevel + 1);
}
