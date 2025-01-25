export class NotImplementError extends Error {
  constructor(msg: string = "") {
    super(msg);
  }
}
export class AssertFalse extends Error {
  constructor(msg: string = "") {
    super(msg);
  }
}

export class CannotResolveSymbol extends AssertFalse {
  constructor() {
    super("cannot resolve symbol");
  }
}
