import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateRawTypeByTypeNode } from "./type_generator.js";

export function generateExpression(node: ts.Expression, config: CodeEmitConfig): string {
  switch (node.kind) {
    case ts.SyntaxKind.NumericLiteral:
      return node.getText();
    case ts.SyntaxKind.Identifier:
      return `ts_${node.getText()}`;
    case ts.SyntaxKind.BinaryExpression:
      return generateBinaryExpression(node as ts.BinaryExpression, config);
    case ts.SyntaxKind.CallExpression:
      return generateCallExpression(node as ts.CallExpression, config);
    case ts.SyntaxKind.NewExpression:
      return generateNewExpression(node as ts.NewExpression, config);
    default:
      throw new NotImplementError(`unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
  }
}

function generateBinaryOperatorBuiltinFunc(token: ts.BinaryOperatorToken, _: CodeEmitConfig): string {
  let tokenName = ts.SyntaxKind[token.kind]
    .replace(/[A-Z]/g, (r: string) => `_${r.toLowerCase()}`)
    .replace("_token", "");
  return `ts_builtin::binary_operator${tokenName}`;
}

function generateBinaryExpression(node: ts.BinaryExpression, config: CodeEmitConfig): string {
  return `${generateBinaryOperatorBuiltinFunc(node.operatorToken, config)}(${generateExpression(
    node.left,
    config
  )}, ${generateExpression(node.right, config)})`;
}

function generateCallExpression(node: ts.CallExpression, config: CodeEmitConfig): string {
  const args = node.arguments.map((arg) => generateExpression(arg, config)).join(", ");
  return `${generateExpression(node.expression, config)}(${args})`;
}

function generateNewExpression(node: ts.NewExpression, config: CodeEmitConfig): string {
  const args = node.arguments?.map((v) => generateExpression(v, config)).join(",") ?? "";
  const type = generateRawTypeByTypeNode(node.expression, config);
  return `new ${type}(${args})`;
}
