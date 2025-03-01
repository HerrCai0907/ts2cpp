import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateTypeByNode } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { generatedSymbolPrefix } from "./builtin/runtime.js";
import { indent, indentConfig } from "./indent.js";
import { generateExpression } from "./expression_generator.js";
import { emitStatement } from "./statement_emitter.js";

export function emitGlobalDefinition(node: ts.VariableDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (!ts.isIdentifier(node.name)) throw new NotImplementError();
  const type = generateTypeByNode(node.name, config);
  w(`static ${type} ${generateIdentifier(node.name, config)}{};`);
}

export function emitGlobalInit(nodes: ts.Statement[], config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`void ${generatedSymbolPrefix}_init() {`);
  nodes.forEach((node) => {
    const innerConfig = indentConfig(config);
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (declaration.initializer == undefined) return;
        if (!ts.isIdentifier(declaration.name)) throw new NotImplementError();
        const name = generateIdentifier(declaration.name, innerConfig);
        const initExpr = generateExpression(declaration.initializer, innerConfig);
        indent(w)(`${name} = ${initExpr};`);
      });
      return;
    }
    emitStatement(node, innerConfig);
  });
  w("}");
}
