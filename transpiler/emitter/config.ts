import { ts } from "@ts-morph/bootstrap";

export class CodeEmitConfig {
  constructor(
    public println: (str: string) => void,
    public sourceFile: ts.SourceFile,
    public typeChecker: ts.TypeChecker,
    public indentLevel: number = 0,
  ) {}

  get write() {
    return (s: string) => this.println("  ".repeat(this.indentLevel) + s);
  }
}
