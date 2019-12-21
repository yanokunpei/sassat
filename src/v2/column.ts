import { columnTypeToTsType, DBColumnTypes } from '../migration/column/columnTypes';
import { ReferenceColumn } from './referenceColumn';
import { columnTypeToGqlPrimitive } from '../generator/gql/sasatToGqlType';
import { GqlPrimitive } from '../generator/gql/types';
import { ColumnData } from '../migration/column/columnData';
import { Table } from './table';
import { columnToSql } from './sql/columnToSql';
import { SerializedColumn } from './serializedStore';

export interface Column {
  name: string;
  toSql: () => string;
  isReference: () => this is ReferenceColumn;
  serialize: () => SerializedColumn;
}

export class NormalColumn implements Column {
  constructor(public data: ColumnData, public table: Table) {}
  get name(): string {
    return this.data.columnName;
  }
  sqlType(): DBColumnTypes {
    return this.data.type;
  }
  tsType(): string {
    return columnTypeToTsType(this.sqlType());
  }
  gqlType(): GqlPrimitive {
    return columnTypeToGqlPrimitive(this.sqlType());
  }

  toSql(): string {
    return columnToSql(this);
  }

  isReference() {
    return false;
  }

  serialize() {
    return this.data;
  }
}
