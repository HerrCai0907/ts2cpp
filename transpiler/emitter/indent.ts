export function indent(write: (m: string) => void) {
  return (m: string) => write(`  ${m}`);
}
