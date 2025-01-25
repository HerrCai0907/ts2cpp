import { AssertFalse, NotImplementError } from "./error.js";
import { FunctionDeclaration, FunctionParameter } from "./IR/function.js";
import { ts } from "@ts-morph/bootstrap";

export interface CodeEmitConfig {
  write: (str: string) => void;
}

function generateFunctionParameter(param: FunctionParameter): string {
  return `${param.type.name.cppIdentifier} ${param.name.cppIdentifier}`;
}

function generateExpression(node: ts.Expression): string {
  switch (node.kind) {
    case ts.SyntaxKind.NumericLiteral:
      return node.getText();
    case ts.SyntaxKind.Identifier:
      return `ts_${node.getText()}`;
    case ts.SyntaxKind.BinaryExpression:
      return generateBinaryExpression(node as ts.BinaryExpression);
    default:
      throw new NotImplementError(`unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
  }
}

function generateBinaryToken(token: ts.BinaryOperatorToken): string {
  return token.getText();
}

function generateBinaryExpression(node: ts.BinaryExpression): string {
  return `${generateExpression(node.left)} ${generateBinaryToken(node.operatorToken)} ${generateExpression(node.right)}`;
}

function emitBlock(node: ts.Block, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  for (const statement of node.statements) {
    emitStatement(statement, config);
  }
}
function emitReturnStatement(node: ts.ReturnStatement, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (node.expression == undefined) {
    w(`return;`);
  } else {
    w(`return ${generateExpression(node.expression)};`);
  }
}

function emitStatement(node: ts.Statement, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  switch (node.kind) {
    case ts.SyntaxKind.Block:
      emitBlock(node as ts.Block, config);
      break;
    case ts.SyntaxKind.ReturnStatement:
      emitReturnStatement(node as ts.ReturnStatement, config);
      break;
    default:
      throw new NotImplementError(`unhandled statement kind ${ts.SyntaxKind[node.kind]}`);
  }
}

export function emitFunctionDeclaration(func: FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const parameterString = func.parameters.map((param) => generateFunctionParameter(param)).join(", ");
  w(`auto ${func.name.cppIdentifier}(${parameterString}) -> ${func.returnType.name.cppIdentifier};`);
}

export function emitFunctionDefinition(func: FunctionDeclaration, config: CodeEmitConfig) {
  if (func.body == undefined) throw new AssertFalse("function body is null");
  let w = (str: string) => config.write(str);
  const parameterString = func.parameters.map((param) => generateFunctionParameter(param)).join(", ");
  w(`auto ${func.name.cppIdentifier}(${parameterString}) -> ${func.returnType.name.cppIdentifier} {`);
  emitBlock(func.body, config);
  w(`}`);
}
