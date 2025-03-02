import { ts } from "@ts-morph/bootstrap";
import * as morph from "@ts-morph/bootstrap";

export class Source {
  constructor(
    public readonly path: string,
    public readonly text: string,
  ) {}
}

export class SourceLoader {
  private _project = morph.createProjectSync({ skipLoadingLibFiles: true });
  program = this._project.createProgram();

  loadConfig(configPath: string) {
    this._project.addSourceFilesFromTsConfigSync(configPath);
    this.program = this._project.createProgram();
  }

  loadSource(source: Source): void {
    this._project.createSourceFile(source.path, source.text);
    this.program = this._project.createProgram();
  }

  forEachSource<T>(fn: (node: ts.SourceFile) => T): T[] {
    const sources = this.program
      .getSourceFiles()
      .filter((s) => !this.program.isSourceFileFromExternalLibrary(s) && !this.program.isSourceFileDefaultLibrary(s));
    return sources.map(fn);
  }

  getDiags(): string[] {
    return this.program.getSyntacticDiagnostics().map((d) => d.messageText.toString());
  }

  get typeChecker() {
    return this.program.getTypeChecker();
  }
}
