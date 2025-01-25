import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generateIdentifier } from "./identifier_generator.js";
import { CannotResolveSymbol, NotImplementError } from "../error.js";
import { generateType } from "./type_generator.js";

export function emitClassPreDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  let w = (str: string) => config.write(str);
  w(`struct ${generateIdentifier(node.name, config)};`);
}

export function emitClassDeclaration(node: ts.ClassDeclaration, config: CodeEmitConfig) {
  if (node.name == undefined) throw new NotImplementError();
  let w = (str: string) => config.write(str);
  let { typeChecker } = config;
  w(`struct ${generateIdentifier(node.name, config)} {`);
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        const symbol = typeChecker.getSymbolAtLocation(member.name);
        if (symbol == undefined) throw new CannotResolveSymbol();
        w(`  ${generateType(typeChecker.getTypeOfSymbol(symbol), config)} ${generateIdentifier(member.name, config)};`);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    } else {
      throw new NotImplementError(ts.SyntaxKind[member.kind]);
    }
  });
  w(`};`);
}

export function emitClassDefinition(node: ts.ClassDeclaration, config: CodeEmitConfig) {}
