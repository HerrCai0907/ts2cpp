import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generateIdentifier } from "./identifier_generator.js";
import { CannotResolveSymbol, NotImplementError } from "../error.js";
import { generateType } from "./type_generator.js";
import {} from "./type_helper.js";
import { emitMethodDeclaration, emitMethodDefinition } from "./function_emitter.js";
import { indent } from "./indent.js";

export function emitClassPreDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (node.name == undefined) throw new NotImplementError();
  w(`struct ${generateIdentifier(node.name, config)};`);
}

export function emitClassDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (node.name == undefined) throw new NotImplementError();
  let { typeChecker } = config;
  w(`struct ${generateIdentifier(node.name, config)} {`);
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        const symbol = typeChecker.getSymbolAtLocation(member.name);
        if (symbol == undefined) throw new CannotResolveSymbol();
        const type = typeChecker.getTypeOfSymbol(symbol);
        indent(w)(`${generateType(type, config)} ${generateIdentifier(member.name, config)};`);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    } else if (ts.isMethodDeclaration(member)) {
      emitMethodDeclaration(member, { ...config, write: indent(w) });
    } else {
      throw new NotImplementError(ts.SyntaxKind[member.kind]);
    }
  });
  w(`};`);
}

export function emitClassDefinition(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  if (node.name == undefined) throw new NotImplementError();
  node.members.forEach((member) => {
    if (ts.isMethodDeclaration(member)) {
      emitMethodDefinition(node, member, { ...config, write: indent(w) });
    }
  });
}
