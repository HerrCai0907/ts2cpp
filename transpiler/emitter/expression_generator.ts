import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";

export function generateExpression(node: ts.Expression, config: CodeEmitConfig): string {
  switch (node.kind) {
    case ts.SyntaxKind.NumericLiteral:
      return node.getText();
    case ts.SyntaxKind.Identifier:
      return `ts_${node.getText()}`;
    case ts.SyntaxKind.BinaryExpression:
      return generateBinaryExpression(node as ts.BinaryExpression, config);
    default:
      throw new NotImplementError(`unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
  }
}

function generateBinaryOperatorBuiltinFunc(token: ts.BinaryOperatorToken, _: CodeEmitConfig): string {
  let tokenName = ts.SyntaxKind[token.kind].replace(/[A-Z]/g, (r: string) => `_${r.toLowerCase()}`);
  return `ts_builtin::${tokenName}`;
}

function generateBinaryExpression(node: ts.BinaryExpression, config: CodeEmitConfig): string {
  return `${generateBinaryOperatorBuiltinFunc(node.operatorToken, config)}(${generateExpression(node.left, config)}, ${generateExpression(node.right, config)})`;
}
