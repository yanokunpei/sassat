import { KeywordTypeNode, TsFile, tsg } from '../../../tsg/index.js';
import { EntityNode, FieldNode } from '../../nodes/entityNode.js';
import {
  makeContextTypeRef,
  makeTypeRef,
} from './scripts/getEntityTypeRefs.js';
import { Directories, Directory } from '../../directory.js';
import { sqlValueToTsExpression } from './scripts/sqlValueToTsExpression.js';
import { columnTypeToTsType } from '../../../migration/column/columnTypes.js';

const DIR: Directories = 'GENERATED_DS';

export const generateAutoGeneratedDatasource = (node: EntityNode): TsFile => {
  return new TsFile(
    tsg.typeAlias(
      'QueryResult',
      tsg.intersectionType(
        makeTypeRef(node.name, 'withRelation', DIR).partial(),
        makeTypeRef(node.name, 'identifiable', DIR),
      ),
    ),
    tsg
      .class(node.name.generatedDataSourceName())
      .export()
      .abstract()
      .extends(
        tsg
          .extends(
            tsg.typeRef('BaseDBDataSource', [
              makeTypeRef(node.name, 'entity', DIR),
              makeTypeRef(node.name, 'identifiable', DIR),
              makeTypeRef(node.name, 'creatable', DIR),
              makeTypeRef(node.name, 'updatable', DIR),
              makeTypeRef(node.name, 'fields', DIR),
              tsg.typeRef('QueryResult'),
            ]),
          )
          .addImport(
            ['BaseDBDataSource'],
            Directory.resolve(DIR, 'BASE', 'baseDBDataSource'),
          ),
      )
      .addProperty(...makeClassProperties(node))
      .addMethod(makeDefaultValueMethod(node), ...makeFindMethods(node)),
  ).disableEsLint();
};

export const makeClassProperties = (node: EntityNode) => {
  const ai = node.fields.find(it => it.isAutoIncrement);
  return [
    tsg
      .propertyDeclaration('tableName', KeywordTypeNode.string, false)
      .modifiers(tsg.propertyModifiers().readonly())
      .initializer(tsg.string(node.tableName)),
    tsg
      .propertyDeclaration(
        'fields',
        tsg.arrayType(KeywordTypeNode.string),
        false,
      )
      .modifiers(tsg.propertyModifiers().readonly())
      .initializer(tsg.array(node.fields.map(it => tsg.string(it.fieldName)))),
    tsg
      .propertyDeclaration(
        'primaryKeys',
        tsg.arrayType(KeywordTypeNode.string),
        false,
      )
      .modifiers(tsg.propertyModifiers().readonly().protected())
      .initializer(tsg.array(node.identifyKeys.map(it => tsg.string(it)))),
    tsg
      .propertyDeclaration(
        'identifyFields',
        tsg.arrayType(KeywordTypeNode.string),
        false,
      )
      .modifiers(tsg.propertyModifiers().readonly().protected())
      .initializer(
        tsg.array(
          node.identifyKeys
            .map(it => node.fields.find(f => it === f.columnName)!.fieldName)
            .map(tsg.string),
        ),
      ),
    tsg
      .propertyDeclaration(
        'autoIncrementColumn',
        tsg.unionType(KeywordTypeNode.string, KeywordTypeNode.undefined),
        true,
      )
      .modifiers(tsg.propertyModifiers().readonly().protected())
      .initializer(ai ? tsg.string(ai.fieldName) : tsg.identifier('undefined')),
  ];
};

const fieldToExpression = (node: FieldNode) => {
  if (node.column.defaultCurrentTimeStamp) {
    return tsg
      .identifier('getCurrentDateTimeString')
      .addImport(['getCurrentDateTimeString'], 'sasat')
      .call();
  }
  return sqlValueToTsExpression(node.column.default!);
};

const makeDefaultValueMethod = (node: EntityNode) => {
  const columns = node.fields.filter(
    it => it.column.defaultCurrentTimeStamp || it.column.default !== undefined,
  );
  const properties = columns.map(it => {
    return tsg.propertyAssign(it.fieldName, fieldToExpression(it));
  });
  const body = tsg.return(tsg.object(...properties));

  return tsg
    .method(
      'getDefaultValueString',
      [],
      columns.length !== 0
        ? tsg.typeRef(node.name.name).pick(...columns.map(it => it.fieldName))
        : tsg.typeRef(node.name.name).partial(),
      [body],
    )
    .modifiers(tsg.methodModifiers().protected());
};

const makeFindMethods = (node: EntityNode) => {
  const qExpr = tsg.identifier('QExpr').importFrom('sasat');
  return node.findMethods.map(it => {
    const bve = it.params.flatMap(it => {
      if (!it.entity)
        return qExpr
          .property('conditions')
          .property('eq')
          .call(
            qExpr
              .property('field')
              .call(
                tsg.identifier('tableName'),
                tsg.string(it.columnName.toString()),
              ),
            qExpr
              .property('value')
              .call(tsg.identifier(it.fieldName.toString())),
          );
      return it.fields.map(field => {
        return qExpr
          .property('conditions')
          .property('eq')
          .call(
            qExpr
              .property('field')
              .call(tsg.identifier('tableName'), tsg.string(field.columnName)),
            qExpr
              .property('value')
              .call(tsg.identifier(it.name).property(field.fieldName)),
          );
      });
    });
    const body = [
      tsg.variable(
        'const',
        'tableName',
        tsg.identifier('fields?.tableAlias || "t0"'),
      ),
      tsg.return(
        tsg.identifier(it.isArray ? 'this.find' : 'this.first').call(
          tsg.identifier('fields'),
          tsg.object().addProperties(
            tsg.spreadAssign(tsg.identifier('options')),
            tsg.propertyAssign(
              'where',
              qExpr
                .property('conditions')
                .property('and')
                .call(...bve, tsg.identifier('options?').property('where')),
            ),
          ),
          tsg.identifier('context'),
        ),
      ),
    ];
    const returnType = tsg.typeRef('QueryResult');
    return tsg.method(
      it.name,
      [
        ...it.params.map(it =>
          tsg.parameter(
            it.entity ? it.name.toString() : it.fieldName,
            it.entity
              ? makeTypeRef(it.entityName, 'identifiable', 'GENERATED_DS')
              : tsg.typeRef(columnTypeToTsType(it.dbtype)),
          ),
        ),
        tsg.parameter(`fields?`, makeTypeRef(node.name, 'fields', DIR)),
        tsg.parameter(
          'options?',
          it.isArray
            ? tsg.typeRef('QueryOptions').importFrom('sasat')
            : tsg.typeRef('Omit', [
                tsg.typeRef('QueryOptions').importFrom('sasat'),
                tsg.typeRef('"offset" | "limit" | "sort"'),
              ]),
        ),
        tsg.parameter('context?', makeContextTypeRef(DIR)),
      ],
      tsg.typeRef('Promise', [
        it.isArray
          ? tsg.arrayType(returnType)
          : tsg.unionType(returnType, tsg.typeRef('null')),
      ]),
      body,
    );
  });
};
