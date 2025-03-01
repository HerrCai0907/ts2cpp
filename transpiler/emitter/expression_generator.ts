import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateRawTypeByTypeNode } from "./type_generator.js";
import { generateGetterIdentifier, generateIdentifier, generateSetterIdentifier } from "./identifier_generator.js";
import assert from "assert";
import { isAccessMethod, isAccessProperty } from "./symbol_helper.js";

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
    case ts.SyntaxKind.ThisKeyword:
      return `this`;
    case ts.SyntaxKind.ArrowFunction:
      return generateArrowFunction(node as ts.ArrowFunction, config);
    default:
      throw new NotImplementError(`unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
  }
}

function generateBinaryOperatorBuiltinFunc(token: ts.BinaryOperatorToken, _: CodeEmitConfig): string {
  let kind: string = ts.SyntaxKind[token.kind];
  let tokenName = kind.replace(/[A-Z]/g, (r: string) => `_${r.toLowerCase()}`).replace("_token", "");
  return `builtin::binary_operator${tokenName}`;
}

function ignoreParentheses(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}
function isBinaryExpressionSetField(node: ts.BinaryExpression, config: CodeEmitConfig): boolean {
  if (node.operatorToken.kind != ts.SyntaxKind.EqualsToken) return false;
  const left = ignoreParentheses(node.left);
  if (!ts.isPropertyAccessExpression(left)) return false;
  if (!isAccessProperty(left, config)) throw new NotImplementError("only support property access");
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
  if (isBinaryExpressionSetField(node, config)) {
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
  const expr = generateExpression(node.expression, config);
  const args = node.arguments.map((arg) => generateExpression(arg, config)).join(", ");
  return `${expr}(${args})`;
}

function generateNewExpression(node: ts.NewExpression, config: CodeEmitConfig): string {
  const args = node.arguments?.map((v) => generateExpression(v, config)).join(",") ?? "";
  const type = generateRawTypeByTypeNode(node.expression, config);
  return `new ${type}(${args})`;
}

function generatePropertyAccessExpression(node: ts.PropertyAccessExpression, config: CodeEmitConfig): string {
  if (!ts.isIdentifier(node.name)) throw new NotImplementError("only support identifier property access");
  const expr = generateExpression(node.expression, config);
  if (isAccessMethod(node, config)) {
    return `${expr}->${generateIdentifier(node.name, config)}`;
  }
  if (isAccessProperty(node, config)) {
    return `${expr}->${generateGetterIdentifier(node.name, config)}()`;
  }
  throw new NotImplementError();
}

function generateArrowFunction(node: ts.ArrowFunction, config: CodeEmitConfig): string {
  return ``;
}
