import { CodeEmitConfig } from "./config.js";

export function indent(write: (m: string) => void) {
  return (m: string) => write(`  ${m}`);
}

export function indentConfig(config: CodeEmitConfig, level = 1): CodeEmitConfig {
  return new CodeEmitConfig(config.println, config.sourceFile, config.typeChecker, config.indentLevel + level);
}
