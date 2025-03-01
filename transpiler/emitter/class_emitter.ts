import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generateGetterIdentifier, generateIdentifier, generateSetterIdentifier } from "./identifier_generator.js";
import { NotImplementError } from "../error.js";
import { generateTypeByNode } from "./type_generator.js";
import {
  emitConstructorDeclaration,
  emitConstructorDefinition,
  emitDefaultConstructorDeclaration,
  emitDefaultConstructorDefinition,
  emitMethodDeclaration,
  emitMethodDefinition,
} from "./function_emitter.js";
import { indent, indentConfig } from "./indent.js";
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
  const innerConfig = indentConfig(config);
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        emitField(member, innerConfig);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    } else if (ts.isMethodDeclaration(member)) {
      emitMethodDeclaration(member, innerConfig);
    } else if (ts.isConstructorDeclaration(member)) {
    } else {
      throw new NotImplementError(ts.SyntaxKind[member.kind]);
    }
  });

  const constructor = node.members.find((m) => ts.isConstructorDeclaration(m));
  if (constructor) {
    emitConstructorDeclaration(node, constructor, innerConfig);
  } else {
    const fieldDefaultInit = extractFieldDefaultInit(node);
    if (fieldDefaultInit.length > 0) {
      emitDefaultConstructorDeclaration(node, innerConfig);
    }
  }

  indent(w)(`void ${gcVisitAllChildrenFn}() const override;`);
  w(`};`);
}

export function emitClassDefinition(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  node.members.forEach((member) => {
    if (ts.isMethodDeclaration(member)) {
      emitMethodDefinition(node, member, config);
    }
  });
  emitConstructor(node, config);
  emitVisitOverride(node, config);
}

function extractFieldDefaultInit(node: ts.ClassDeclaration): Array<[ts.Identifier, ts.Expression]> {
  const fieldDefaultInit = new Array<[ts.Identifier, ts.Expression]>();
  node.members.forEach((m) => {
    if (!ts.isPropertyDeclaration(m)) return;
    if (!ts.isIdentifier(m.name)) return;
    if (m.initializer == undefined) return;
    fieldDefaultInit.push([m.name, m.initializer]);
  });
  return fieldDefaultInit;
}

function emitConstructor(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  const constructor: ts.ConstructorDeclaration | undefined = node.members.find((m) => ts.isConstructorDeclaration(m));
  const fieldDefaultInit = extractFieldDefaultInit(node);
  if (constructor != undefined) {
    emitConstructorDefinition(node, constructor, fieldDefaultInit, config);
  } else {
    emitDefaultConstructorDefinition(node, fieldDefaultInit, config);
  }
}

function emitField(node: ts.PropertyDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (ts.isIdentifier(node.name)) {
    const type = generateTypeByNode(node.name, config);
    const variable = generateIdentifier(node.name, config);
    w(`${type} ${variable}{};`);
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
