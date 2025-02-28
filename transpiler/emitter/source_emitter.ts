import { ts } from "@ts-morph/bootstrap";

export function convertToNamespace(sourceFile: ts.SourceFile): string {
  let fileName = sourceFile.fileName;
  if (fileName.startsWith("/")) fileName = fileName.slice(1);
  if (fileName.endsWith(".ts")) fileName = fileName.slice(0, -3);
  return fileName.replaceAll("/", "::");
}
