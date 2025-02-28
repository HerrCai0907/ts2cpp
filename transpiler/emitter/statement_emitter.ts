import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateExpression } from "./expression_generator.js";
import { gcStackManagerVariant, gcStoreReturnFn } from "./builtin/gc.js";

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

export function emitStatement(node: ts.Statement, config: CodeEmitConfig) {
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
