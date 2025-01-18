import { ts } from "@ts-morph/bootstrap";
import { env } from "node:process";
import { NotImplementError } from "./error.js";
import chalk from "chalk";

export namespace transpiler {
  export class Type {
    constructor(public name: string) {}
  }
  export class Identifier {
    constructor(public name: string) {}
  }
  export class Argument {
    constructor(public name: Identifier) {}
  }
  export class FunctionDeclaration {
    constructor(public name: string) {}
  }
}

export class DeclarationExtractor {
  constructor(public readonly typeChecker: ts.TypeChecker) {}

  funcs = new Array<transpiler.FunctionDeclaration>();

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

  private _handleFunctionDeclaration(node: ts.FunctionDeclaration) {
    if (node.name == undefined) throw new NotImplementError("");
    let symbol = this.typeChecker.getSymbolAtLocation(node.name);
    if (symbol == undefined) throw new NotImplementError("");
    this.funcs.push(new transpiler.FunctionDeclaration(symbol.escapedName.toString()));
    console.log(`symbol?.escapedName ${symbol.escapedName}`);
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
        this._handleFunctionDeclaration(node as ts.FunctionDeclaration);
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
