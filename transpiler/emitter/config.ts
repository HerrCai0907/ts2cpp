import { ts } from "@ts-morph/bootstrap";

export interface CodeEmitConfig {
  write: (str: string) => void;
  typeChecker: ts.TypeChecker;
}
