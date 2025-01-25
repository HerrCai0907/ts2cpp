import { env } from "node:process";
import { ts } from "@ts-morph/bootstrap";
import chalk from "chalk";
import { NotImplementError } from "./error.js";

export class DeclarationExtractor {
  constructor() {}

  funcs = new Array<ts.FunctionDeclaration>();

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
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
        node.forEachChild((child) => this._runImpl(child));
        break;
      case ts.SyntaxKind.FirstStatement:
        break;
      case ts.SyntaxKind.FunctionDeclaration:
        this.funcs.push(node as ts.FunctionDeclaration);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        (node as ts.ImportDeclaration).importClause?.forEachChild((child) => this._runImpl(child));
        break;
      case ts.SyntaxKind.NamedImports:
        (node as ts.NamedImports).elements.forEach((element) => this._runImpl(element));
        break;
      case ts.SyntaxKind.ImportSpecifier:
        break;
      case ts.SyntaxKind.EndOfFileToken:
        break;
      default:
        throw new NotImplementError(`Unsupported node kind: ${ts.SyntaxKind[node.kind]}`);
    }
    this._endVisit(node);
  }
}
