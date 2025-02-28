import { ts } from "@ts-morph/bootstrap";
import { NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { generateTypeByNode } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";

export function emitGlobalDefinition(node: ts.VariableDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (!ts.isIdentifier(node.name)) throw new NotImplementError();
  const type = generateTypeByNode(node.name, config);
  w(`static ${type} ${generateIdentifier(node.name, config)}{};`);
}
