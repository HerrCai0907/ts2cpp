import { ts } from "@ts-morph/bootstrap";
import { AssertFalse, NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { emitStatement } from "./statement_emitter.js";
import { generateType } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { zip } from "../adt/array.js";
import { indent } from "./indent.js";

export function emitFunctionDeclaration(funcNode: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const { name, returnType, parameters } = processFunctionDeclaration(funcNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType};`);
}

export function emitFunctionDefinition(funcNode: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (funcNode.body == undefined) throw new AssertFalse("function body is null");
  const { name, returnType, parameters } = processFunctionDeclaration(funcNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType} {`);
  emitStatement(funcNode.body, { ...config, write: indent(w) });
  w(`}`);
}

export function emitMethodDeclaration(methodNode: ts.MethodDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const { name, returnType, parameters } = processFunctionDeclaration(methodNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType};`);
}

export function emitMethodDefinition(
  classNode: ts.ClassDeclaration,
  methodNode: ts.MethodDeclaration,
  config: CodeEmitConfig
) {
  let w = (str: string) => config.write(str);
  if (methodNode.body == undefined) throw new AssertFalse("function body is null");
  if (classNode.name == undefined) throw new AssertFalse("function body is null");
  const { name, returnType, parameters } = processFunctionDeclaration(methodNode, config);
  w(`auto ${generateIdentifier(classNode.name, config)}::${name}(${parameters}) -> ${returnType} {`);
  emitStatement(methodNode.body, { ...config, write: indent(w) });
  w(`}`);
}

function processFunctionDeclaration(node: ts.FunctionDeclaration | ts.MethodDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  const symbol = config.typeChecker.getSymbolAtLocation(node.name);
  if (symbol == undefined) throw new NotImplementError();
  const signature = config.typeChecker.getSignatureFromDeclaration(node);
  if (signature == undefined) throw new NotImplementError();
  if (!ts.isIdentifier(node.name)) throw new NotImplementError();
  const name = generateIdentifier(node.name, config);
  const returnType = generateType(signature.getReturnType(), config);
  const parameters = zip(signature.getParameters(), node.parameters)
    .map(([symbol, decl]) => {
      if (ts.isIdentifier(decl.name)) {
        return `${generateType(config.typeChecker.getTypeOfSymbol(symbol), config)} ${generateIdentifier(decl.name, config)}`;
      } else {
        throw new NotImplementError("BindingPattern");
      }
    })
    .join(", ");
  return { name, returnType, parameters };
}
