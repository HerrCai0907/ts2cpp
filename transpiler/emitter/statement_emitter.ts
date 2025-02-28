import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateExpression } from "./expression_generator.js";
import { gcStackManagerVariant, gcStoreReturnFn } from "./builtin/gc.js";
import { generateTypeByNode } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";

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
    w(`return ${gcStoreReturnFn}(${gcStackManagerVariant}, ${generateExpression(node.expression, config)});`);
  }
}
function emitVariableStatement(node: ts.VariableStatement, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  let declarations = node.declarationList.declarations;
  if (declarations.length != 1) throw new NotImplementError(`multiple declarations in variable statement`);
  let declaration = declarations[0];
  const type = generateTypeByNode(declaration.name, config);
  const initExpr = declaration.initializer ? generateExpression(declaration.initializer, config) : "";
  if (!ts.isIdentifier(declaration.name)) throw new NotImplementError(ts.SyntaxKind[declaration.name.kind]);
  w(`${type} ${generateIdentifier(declaration.name, config)}{${initExpr}};`);
}
function emitExpressionStatement(node: ts.ExpressionStatement, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`${generateExpression(node.expression, config)};`);
}

export function emitStatement(node: ts.Statement, config: CodeEmitConfig) {
  switch (node.kind) {
    case ts.SyntaxKind.Block:
      emitBlock(node as ts.Block, config);
      break;
    case ts.SyntaxKind.ReturnStatement:
      emitReturnStatement(node as ts.ReturnStatement, config);
      break;
    case ts.SyntaxKind.VariableStatement:
      emitVariableStatement(node as ts.VariableStatement, config);
      break;
    case ts.SyntaxKind.ExpressionStatement:
      emitExpressionStatement(node as ts.ExpressionStatement, config);
      break;
    default:
      throw new NotImplementError(`unhandled statement kind ${node.kind} ${ts.SyntaxKind[node.kind]}`);
  }
}
