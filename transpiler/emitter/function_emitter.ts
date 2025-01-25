import { ts } from "@ts-morph/bootstrap";
import { AssertFalse, NotImplementError } from "../error.js";
import { CodeEmitConfig } from "./config.js";
import { emitStatement } from "./statement_emitter.js";
import { generateType } from "./type_generator.js";
import { generateIdentifier } from "./identifier_generator.js";
import { zip } from "../adt/array.js";

export function emitFunctionDeclaration(node: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let w = (str: string) => config.write(str);
  const { name, returnType, parameters } = processFunctionDeclaration(node, config);
  w(`auto ${name}(${parameters}) -> ${returnType};`);
}

export function emitFunctionDefinition(node: ts.FunctionDeclaration, config: CodeEmitConfig) {
  if (node.body == undefined) throw new AssertFalse("function body is null");
  let w = (str: string) => config.write(str);
  const { name, returnType, parameters } = processFunctionDeclaration(node, config);
  w(`auto ${name}(${parameters}) -> ${returnType} {`);
  emitStatement(node.body, config);
  w(`}`);
}

function getSignatureFromDeclaration(node: ts.FunctionDeclaration, config: CodeEmitConfig): ts.Signature {
  if (node.name == undefined) throw new NotImplementError();
  const symbol = config.typeChecker.getSymbolAtLocation(node.name);

  if (symbol == undefined) throw new NotImplementError();
  const signature = config.typeChecker.getSignatureFromDeclaration(node);
  if (signature == undefined) throw new NotImplementError();
  return signature;
}

function processFunctionDeclaration(node: ts.FunctionDeclaration, config: CodeEmitConfig) {
  let sig = getSignatureFromDeclaration(node, config);
  if (node.name == undefined) throw new NotImplementError();
  const name = generateIdentifier(node.name, config);
  const returnType = generateType(sig.getReturnType(), config);
  const parameters = zip(sig.getParameters(), node.parameters)
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
