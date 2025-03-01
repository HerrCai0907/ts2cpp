import { ts } from "@ts-morph/bootstrap";
import { AssertFalse, NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { emitStatement } from "./statement_emitter.js";
import { generateTypeByType } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { zip } from "../adt/array.js";
import { indent } from "./indent.js";
import { emitFunctionEntry } from "./builtin/gc.js";

export function emitFunctionDeclaration(funcNode: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const name = getFunctionDeclarationName(funcNode, config);
  const { returnType, parameters } = processFunctionDeclaration(funcNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType};`);
}

export function emitFunctionDefinition(funcNode: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (funcNode.body == undefined) throw new AssertFalse("function body is null");
  const name = getFunctionDeclarationName(funcNode, config);
  const { returnType, parameters } = processFunctionDeclaration(funcNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType} {`);
  const innerConfig = { ...config, write: indent(w) };
  emitFunctionEntry(innerConfig);
  emitStatement(funcNode.body, innerConfig);
  w(`}`);
}

export function emitMethodDeclaration(methodNode: ts.MethodDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const name = getFunctionDeclarationName(methodNode, config);
  const { returnType, parameters } = processFunctionDeclaration(methodNode, config);
  w(`auto ${name}(${parameters}) -> ${returnType};`);
}

export function emitMethodDefinition(
  classNode: ts.ClassDeclaration,
  methodNode: ts.MethodDeclaration,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (methodNode.body == undefined) throw new AssertFalse("function body is null");
  if (classNode.name == undefined) throw new AssertFalse("function name is null");
  const name = getFunctionDeclarationName(methodNode, config);
  const { returnType, parameters } = processFunctionDeclaration(methodNode, config);
  w(`auto ${generateIdentifier(classNode.name, config)}::${name}(${parameters}) -> ${returnType} {`);
  const innerConfig = { ...config, write: indent(w) };
  emitFunctionEntry(innerConfig);
  emitStatement(methodNode.body, innerConfig);
  w(`}`);
}

export function emitConstructorDeclaration(
  classNode: ts.ClassDeclaration,
  methodNode: ts.ConstructorDeclaration,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (classNode.name == undefined) throw new AssertFalse("function body is null");
  const { parameters } = processFunctionDeclaration(methodNode, config);
  const className = generateIdentifier(classNode.name, config);
  w(`explicit ${className}(${parameters});`);
}

export function emitConstructorDefinition(
  classNode: ts.ClassDeclaration,
  methodNode: ts.ConstructorDeclaration,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (methodNode.body == undefined) throw new AssertFalse("function body is null");
  if (classNode.name == undefined) throw new AssertFalse("class without name");
  const { parameters } = processFunctionDeclaration(methodNode, config);
  const className = generateIdentifier(classNode.name, config);
  w(`${className}::${className}(${parameters}) {`);
  const innerConfig = { ...config, write: indent(w) };
  emitFunctionEntry(innerConfig);
  emitStatement(methodNode.body, innerConfig);
  w(`}`);
}

function getFunctionDeclarationName(node: ts.FunctionDeclaration | ts.MethodDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  if (!ts.isIdentifier(node.name)) throw new NotImplementError();
  const name = generateIdentifier(node.name, config);
  return name;
}

function processFunctionDeclaration(node: ts.SignatureDeclaration, config: CodeEmitConfig) {
  const signature = config.typeChecker.getSignatureFromDeclaration(node);
  if (signature == undefined) throw new NotImplementError();
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
  return { returnType, parameters };
}
