import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateRawTypeByTypeNode } from "./type_generator.js";
import { generateGetterIdentifier, generateIdentifier, generateSetterIdentifier } from "./identifier_generator.js";
import assert from "assert";

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
    case ts.SyntaxKind.PropertyAccessExpression:
      return generatePropertyAccessExpression(node as ts.PropertyAccessExpression, config);
    default:
      throw new NotImplementError(`unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
  }
}

function generateBinaryOperatorBuiltinFunc(token: ts.BinaryOperatorToken, _: CodeEmitConfig): string {
  let kind: string = ts.SyntaxKind[token.kind];
  let tokenName = kind.replace(/[A-Z]/g, (r: string) => `_${r.toLowerCase()}`).replace("_token", "");
  return `ts_builtin::binary_operator${tokenName}`;
}

function ignoreParentheses(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}
function isBinaryExpressionFieldSet(node: ts.BinaryExpression): boolean {
  if (node.operatorToken.kind != ts.SyntaxKind.EqualsToken) return false;
  const left = ignoreParentheses(node.left);
  if (!ts.isPropertyAccessExpression(left)) return false;
  return true;
}

function generateFieldSetExpression(node: ts.BinaryExpression, config: CodeEmitConfig): string {
  const left = ignoreParentheses(node.left);
  assert(ts.isPropertyAccessExpression(left));
  const instance = generateExpression(left.expression, config);
  if (!ts.isIdentifier(left.name)) throw new NotImplementError("only support identifier property access");
  return `${instance}->${generateSetterIdentifier(left.name, config)}(${generateExpression(node.right, config)})`;
}

function generateBinaryExpression(node: ts.BinaryExpression, config: CodeEmitConfig): string {
  if (isBinaryExpressionFieldSet(node)) {
    return generateFieldSetExpression(node, config);
  }
  const lhs = generateExpression(node.left, config);
  const rhs = generateExpression(node.right, config);
  if (node.operatorToken.kind == ts.SyntaxKind.EqualsToken) {
    return `${lhs} = ${rhs}`;
  }
  const binaryOperator = generateBinaryOperatorBuiltinFunc(node.operatorToken, config);
  return `${binaryOperator}(${lhs}, ${rhs})`;
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

function generatePropertyAccessExpression(node: ts.PropertyAccessExpression, config: CodeEmitConfig): string {
  if (!ts.isIdentifier(node.name)) throw new NotImplementError("only support identifier property access");
  return `${generateExpression(node.expression, config)}->${generateGetterIdentifier(node.name, config)}()`;
}
