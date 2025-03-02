import { ts } from "@ts-morph/bootstrap";
import { AssertFalse, NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { emitStatement } from "./statement_emitter.js";
import { generateTypeBySymbol, generateTypeByType } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { zip } from "../adt/array.js";
import { indent, indentConfig } from "./indent.js";
import { emitFunctionEntry, gcCreateObjectFn } from "./builtin/gc.js";
import { generateExpression } from "./expression_generator.js";

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
  const innerConfig = indentConfig(config);
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
  const innerConfig = indentConfig(config);
  emitFunctionEntry(innerConfig);
  emitStatement(methodNode.body, innerConfig);
  w(`}`);
}

export function emitConstructorDeclaration(
  classNode: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (classNode.name == undefined) throw new AssertFalse("function body is null");
  const { parameters } = processFunctionDeclaration(constructor, config);
  const className = generateIdentifier(classNode.name, config);
  w(`explicit ${className}(${parameters});`);
}

export function emitDefaultConstructorDeclaration(classNode: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (classNode.name == undefined) throw new AssertFalse("function body is null");
  const className = generateIdentifier(classNode.name, config);
  w(`${className}();`);
}

export function emitConstructorDefinition(
  classNode: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  defaultInit: Array<[ts.Identifier, ts.Expression]>,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (constructor.body == undefined) throw new AssertFalse("function body is null");
  if (classNode.name == undefined) throw new AssertFalse("class without name");
  const { parameters } = processFunctionDeclaration(constructor, config);
  const className = generateIdentifier(classNode.name, config);

  if (defaultInit.length == 0) {
    w(`${className}::${className}(${parameters}) {`);
  } else {
    const init = defaultInit
      .map(([name, initializer]) => {
        const fieldName = generateIdentifier(name, config);
        const initExpr = generateExpression(initializer, config);
        return `${fieldName}{${initExpr}}`;
      })
      .join(",");
    w(`${className}::${className}(${parameters}) : ${init} {`);
  }
  const innerConfig = indentConfig(config);
  emitFunctionEntry(innerConfig);
  emitStatement(constructor.body, innerConfig);
  w(`}`);
}

export function emitDefaultConstructorDefinition(
  classNode: ts.ClassDeclaration,
  defaultInit: Array<[ts.Identifier, ts.Expression]>,
  config: CodeEmitConfig,
) {
  let w = (str: string) => config.write(str);
  if (classNode.name == undefined) throw new AssertFalse("class without name");
  const className = generateIdentifier(classNode.name, config);
  if (defaultInit.length == 0) return;
  const init = defaultInit
    .map(([name, initializer]) => {
      const fieldName = generateIdentifier(name, config);
      const initExpr = generateExpression(initializer, config);
      return `${fieldName}{${initExpr}}`;
    })
    .join(",");
  w(`${className}::${className}() : ${init} {}`);
}

export function emitFunctionExpression(node: ts.ArrowFunction, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const type = generateTypeByType(config.typeChecker.getTypeAtLocation(node), config);
  const { returnType, parameters } = processFunctionDeclaration(node, config);
  // FIXME: closure gc
  // FIXME: different behavior with ts for captured number
  w(`${gcCreateObjectFn}<${type}>(`);
  indent(w)(`[] (${parameters}) -> ${returnType} {`);
  if (ts.isExpression(node.body)) {
    indent(indent(w))(`return ${generateExpression(node.body, config)};`);
  } else {
    const innerConfig = indentConfig(config, 2);
    emitFunctionEntry(innerConfig);
    emitStatement(node.body, innerConfig);
  }
  indent(w)(`}`);
  w(`)`);
}

function getFunctionDeclarationName(node: ts.FunctionDeclaration | ts.MethodDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  if (!ts.isIdentifier(node.name)) throw new NotImplementError();
  const name = generateIdentifier(node.name, config);
  return name;
}

function processFunctionDeclaration(
  node: ts.SignatureDeclaration,
  config: CodeEmitConfig,
): { returnType: string; parameters: string } {
  const signature = config.typeChecker.getSignatureFromDeclaration(node);
  if (signature == undefined) throw new NotImplementError();
  const returnType = generateTypeByType(signature.getReturnType(), config);
  const parameters = zip(signature.getParameters(), node.parameters)
    .map(([symbol, decl]) => {
      if (ts.isIdentifier(decl.name)) {
        const type = generateTypeBySymbol(symbol, config);
        const name = generateIdentifier(decl.name, config);
        return `${type} ${name}`;
      } else {
        throw new NotImplementError("BindingPattern");
      }
    })
    .join(", ");
  return { returnType, parameters };
}
