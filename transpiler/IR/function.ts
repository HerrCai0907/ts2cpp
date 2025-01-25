import { Identifier } from "./base.js";
import { ts } from "@ts-morph/bootstrap";
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
    public parameters: FunctionParameter[],
    public body?: ts.Block
  ) {}
}
