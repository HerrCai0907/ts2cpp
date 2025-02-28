import { CodeEmitConfig } from "../config.js";

export const gcStackManagerVariant = `ts_builtin_stack_manager`;
export function emitFunctionEntryRaii(config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`ts_builtin::StackManager ${gcStackManagerVariant}{};`);
}

export const gcCreateObjectFn = `ts_builtin::create_object`;
export const gcStoreReturnFn = `ts_builtin::store_return`;
export const gcVisitFn = `ts_builtin::gc_visit`;

export const gcObjClass = `ts_builtin::GcObject`;

export const gcVisitAllChildrenFn = `ts_builtin_gc_visit_all_children`;
