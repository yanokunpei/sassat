import { IrGql } from '../ir/gql';
import { DataStoreHandler } from '../entity/dataStore';
import { IrGqlType } from '../ir/gql/types';
import { IrGqlQuery, IrGqlQueryType } from '../ir/gql/query';
import { capitalizeFirstLetter, plural } from '../util/stringUtil';

export class GqlCompiler {
  constructor(private store: DataStoreHandler) {}

  compile(): IrGql {
    const types: IrGqlType[] = this.store.tables.map(it => ({
      typeName: it.getEntityName(),
      params: it.columns.map(it => ({
        name: it.name,
        type: it.type,
        isNullable: it.isNullable(),
        isArray: false,
      })),
    }));

    return {
      types: types,
      queries: [...this.listQuery(), ...this.primaryQuery()],
    };
  }
  private listQuery(): IrGqlQuery[] {
    return this.store.tables.map(it => ({
      queryName: plural(it.tableName),
      queryType: IrGqlQueryType.List,
      entity: it.getEntityName(),
      params: [],
      repositoryFunctionName: 'list',
      isArray: true,
      isNullable: false,
    }));
  }

  private primaryQuery(): IrGqlQuery[] {
    return this.store.tables.map(table => ({
      queryName: table.tableName,
      queryType: IrGqlQueryType.Primary,
      entity: table.getEntityName(),
      params: table.primaryKey.map(it => ({
        name: it,
        type: table.column(it)!.gqlType(),
        isNullable: false,
        isArray: false,
      })),
      repositoryFunctionName: 'findBy' + table.primaryKey.map(capitalizeFirstLetter).join('And'),
      isArray: false,
      isNullable: true,
    }));
  }
}
