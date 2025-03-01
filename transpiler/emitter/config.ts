import { ts } from "@ts-morph/bootstrap";

export interface CodeEmitConfig {
  readonly write: (str: string) => void;
  readonly typeChecker: ts.TypeChecker;
}
