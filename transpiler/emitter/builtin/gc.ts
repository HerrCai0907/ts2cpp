import { CodeEmitConfig } from "../config.js";

export function emitFunctionEntryRaii(config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`ts_builtin::StackManagerRaii raii{};`);
}

export function generateGcObject(ptrExpr: string) {
  return `ts_builtin::create_object(${ptrExpr})`;
}
