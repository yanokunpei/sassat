import { TsCode } from '../abstruct/tsCode';
import { PropertyModifiers } from './modifier/propertyModifiers';
import { Literal } from './literal/literal';
import { Identifier } from './Identifier';
import { isCode, TsType } from './type/type';
import { TsUtil } from '../tsUtil';

export class PropertyDeclaration extends TsCode {
  private _modifiers = new PropertyModifiers();
  private _initializer?: Literal | Identifier = undefined;
  constructor(private propertyName: string, private type: TsType, private optional = false) {
    super();
    if (isCode(type)) this.mergeImport(type);
  }

  modifiers(modifiers: PropertyModifiers): this {
    this._modifiers = modifiers;
    return this;
  }

  initializer(initializer: Literal | Identifier): this {
    this._initializer = initializer;
    this.mergeImport(initializer);
    return this;
  }

  protected toTsString(): string {
    const initializer = this.initializer ? ` = ${this.initializer.toString()}` : '';
    return (
      this.modifiers.toString() +
      `${this.propertyName}${TsUtil.questionToken(this.optional)}: ${this.type}` +
      initializer
    );
  }
}
