import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generateGetterIdentifier, generateIdentifier, generateSetterIdentifier } from "./identifier_generator.js";
import { NotImplementError } from "../error.js";
import { generateTypeByNode } from "./type_generator.js";
import { emitMethodDeclaration, emitMethodDefinition } from "./function_emitter.js";
import { indent } from "./indent.js";
import { gcObjClass, gcVisitAllChildrenFn, gcVisitFn } from "./builtin/gc.js";
import { generateExpression } from "./expression_generator.js";

function getClassName(node: ts.ClassDeclaration, config: CodeEmitConfig): string {
  if (node.name == undefined) throw new NotImplementError();
  return generateIdentifier(node.name, config);
}

export function emitClassPreDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`struct ${getClassName(node, config)};`);
}

export function emitClassDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`struct ${getClassName(node, config)} : public ${gcObjClass} {`);
  const innerConfig = { ...config, write: indent(w) };
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        emitField(member, innerConfig);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    } else if (ts.isMethodDeclaration(member)) {
      emitMethodDeclaration(member, innerConfig);
    } else {
      throw new NotImplementError(ts.SyntaxKind[member.kind]);
    }
  });
  indent(w)(`void ${gcVisitAllChildrenFn}() const override;`);
  w(`};`);
}

export function emitClassDefinition(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (node.name == undefined) throw new NotImplementError();
  node.members.forEach((member) => {
    if (ts.isMethodDeclaration(member)) {
      emitMethodDefinition(node, member, { ...config, write: w });
    }
  });
  emitVisitOverride(node, config);
}

function emitField(node: ts.PropertyDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (ts.isIdentifier(node.name)) {
    const initExpr = node.initializer != undefined ? generateExpression(node.initializer, config) : "";
    const type = generateTypeByNode(node.name, config);
    const variable = generateIdentifier(node.name, config);
    w(`${type} ${variable}{${initExpr}};`);
    w(`${type} const& ${generateGetterIdentifier(node.name, config)}() const noexcept { return this->${variable}; }`);
    w(`void ${generateSetterIdentifier(node.name, config)}(${type} v) noexcept { this->${variable} = v; }`);
  } else {
    throw new NotImplementError(ts.SyntaxKind[node.name.kind]);
  }
}

function emitVisitOverride(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  w(`void ${getClassName(node, config)}::${gcVisitAllChildrenFn}() const {`);
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        indent(w)(`${gcVisitFn}(this->${generateIdentifier(member.name, config)});`);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    }
  });
  w(`}`);
}
