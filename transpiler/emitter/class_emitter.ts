import { ts } from "@ts-morph/bootstrap";
import { CodeEmitConfig } from "./config.js";
import { generateIdentifier } from "./identifier_generator.js";
import { NotImplementError } from "../error.js";
import { generateTypeByNode } from "./type_generator.js";
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
  w(`struct ${generateIdentifier(node.name, config)} : public ts_builtin::GcObject {`);
  const innerConfig = { ...config, write: indent(w) };
  node.members.forEach((member) => {
    if (ts.isPropertyDeclaration(member)) {
      if (ts.isIdentifier(member.name)) {
        indent(w)(`${generateTypeByNode(member.name, config)} ${generateIdentifier(member.name, config)};`);
      } else {
        throw new NotImplementError(ts.SyntaxKind[member.name.kind]);
      }
    } else if (ts.isMethodDeclaration(member)) {
      emitMethodDeclaration(member, innerConfig);
    } else {
      throw new NotImplementError(ts.SyntaxKind[member.kind]);
    }
  });
  indent(w)(`void ts_gc_visit_all_children() const override;`);
  node.members.forEach((member) => {});
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
