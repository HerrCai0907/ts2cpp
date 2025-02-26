import { CodeEmitConfig } from "../config.js";

export function emitFunctionEntryRaii(config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`ts_builtin::StackManagerRaii raii{};`);
}

export const gcCreateObjectFn = `ts_builtin::create_object`;

export const gcVisitFn = `ts_builtin::gc_visit`;

export const gcObjClass = `ts_builtin::GcObject`;
