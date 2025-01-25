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

function generateBinaryToken(token: ts.BinaryOperatorToken, _: CodeEmitConfig): string {
  return token.getText();
}

function generateBinaryExpression(node: ts.BinaryExpression, config: CodeEmitConfig): string {
  return `${generateExpression(node.left, config)} ${generateBinaryToken(node.operatorToken, config)} ${generateExpression(node.right, config)}`;
}
