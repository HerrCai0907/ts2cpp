import { Identifier } from "./base.js";
import { Type } from "./type.js";

export class FunctionParameter {
  constructor(
    public name: Identifier,
    public type: Type
  ) {}
}
export class FunctionDeclaration {
  constructor(
    public name: Identifier,
    public returnType: Type,
    public parameters: FunctionParameter[]
  ) {}
}
