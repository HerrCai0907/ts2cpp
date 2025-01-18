import { ts } from "@ts-morph/bootstrap";
import * as morph from "@ts-morph/bootstrap";
import { AssertFalse } from "./error.js";

export class Source {
  constructor(
    public readonly path: string,
    public readonly text: string
  ) {}
}

export class SourceLoader {
  private _sourcePath = new Set<string>();
  private _project = morph.createProjectSync({ skipLoadingLibFiles: true });
  program = this._project.createProgram();

  loadSource(source: Source): void {
    this._sourcePath.add(source.path);
    this._project.createSourceFile(source.path, source.text);
    this.program = this._project.createProgram();
  }

  forEachSource(fn: (node: ts.SourceFile) => void): void {
    for (let path of this._sourcePath) {
      let source = this.program.getSourceFile(path);
      if (source == undefined) throw new AssertFalse(`invalid source ${path}`);
      fn(source);
    }
  }

  getDiags(): string[] {
    return this.program.getSyntacticDiagnostics().map((d) => d.messageText.toString());
  }

  get typeChecker() {
    return this.program.getTypeChecker();
  }
}
