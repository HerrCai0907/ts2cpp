import { CodeEmitConfig } from "../config.js";

export const gcStackManagerVariant = `ts_builtin_stack_manager`;
export function emitFunctionEntry(config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`builtin::StackManager ${gcStackManagerVariant}{};`);
}

export const gcStoreReturnFn = `builtin::store_return`;
export const gcVisitFn = `builtin::gc_visit`;

export const gcObjClass = `builtin::GcObject`;

export const gcVisitAllChildrenFn = `ts_builtin_gc_visit_all_children`;
