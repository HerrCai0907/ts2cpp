import { env } from "node:process";
import { ts } from "@ts-morph/bootstrap";
import chalk from "chalk";
import { NotImplementError } from "./error.js";

// extractor top level declaration
export class DeclarationExtractor {
  constructor() {}

  funcs = new Array<ts.FunctionDeclaration>();
  records = new Array<ts.ClassDeclaration>();

  private _ident = "";

  run(node: ts.SourceFile) {
    this._runImpl(node);
  }

  private _startVisit(node: ts.Node) {
    if (env["DEBUG"]) console.log(chalk.gray(this._ident + ts.SyntaxKind[node.kind]));
    this._ident += "  ";
  }
  private _endVisit(node: ts.Node) {
    this._ident = this._ident.slice(0, -2);
  }

  private _runImpl(node: ts.Node) {
    this._startVisit(node);
    const SyntaxKind = ts.SyntaxKind;
    switch (node.kind) {
      case SyntaxKind.SourceFile:
        node.forEachChild((child) => this._runImpl(child));
        break;
      case SyntaxKind.FunctionDeclaration:
        this.funcs.push(node as ts.FunctionDeclaration);
        break;
      case SyntaxKind.ClassDeclaration:
        this.records.push(node as ts.ClassDeclaration);
        break;
      case SyntaxKind.EndOfFileToken:
        break;
      default:
        throw new NotImplementError(`Unsupported node kind: ${ts.SyntaxKind[node.kind]}`);
    }
    this._endVisit(node);
  }
}
