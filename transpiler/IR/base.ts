export class Identifier {
  constructor(private _text: string) {}

  get cppIdentifier(): string {
    return `ts_${this._text}`;
  }
}
