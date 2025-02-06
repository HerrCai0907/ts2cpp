import { ts } from "@ts-morph/bootstrap";
import { AssertFalse, NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { emitStatement } from "./statement_emitter.js";
import { generateTypeByType } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { zip } from "../adt/array.js";
import { indent } from "./indent.js";
import { emitFunctionEntryRaii } from "./builtin/gc.js";

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
  const innerConfig = { ...config, write: indent(w) };
  emitFunctionEntryRaii(innerConfig);
  emitStatement(funcNode.body, innerConfig);
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
  const innerConfig = { ...config, write: indent(w) };
  emitFunctionEntryRaii(innerConfig);
  emitStatement(methodNode.body, innerConfig);
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
  const returnType = generateTypeByType(signature.getReturnType(), config);
  const parameters = zip(signature.getParameters(), node.parameters)
    .map(([symbol, decl]) => {
      if (ts.isIdentifier(decl.name)) {
        const type = generateTypeByType(config.typeChecker.getTypeOfSymbol(symbol), config);
        const name = generateIdentifier(decl.name, config);
        return `${type} ${name}`;
      } else {
        throw new NotImplementError("BindingPattern");
      }
    })
    .join(", ");
  return { name, returnType, parameters };
}
