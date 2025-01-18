import { FunctionDeclaration, FunctionParameter } from "./IR/function.js";

export interface CodeEmitConfig {
  write: (str: string) => void;
}

function generateFunctionParameter(param: FunctionParameter, _: CodeEmitConfig): string {
  return `${param.type.name.cppIdentifier} ${param.name.cppIdentifier}`;
}
export function emitFunctionDeclaration(func: FunctionDeclaration, config: CodeEmitConfig) {
  const parameterString = func.parameters.map((param) => generateFunctionParameter(param, config)).join(", ");
  config.write(`auto ${func.name.cppIdentifier}(${parameterString}) -> ${func.returnType.name.cppIdentifier};`);
}
