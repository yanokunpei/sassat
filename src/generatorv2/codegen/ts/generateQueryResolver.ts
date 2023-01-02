import { RootNode } from '../../nodes/rootNode.js';
import {
  PropertyAssignment,
  TsExpression,
  TsFile,
  tsg,
} from '../../../tsg/index.js';
import { QueryNode } from '../../nodes/queryNode.js';
import { columnTypeToTsType } from '../../../migration/column/columnTypes.js';
import { makeTypeRef } from './scripts/getEntityTypeRefs.js';
import { makeDatasource } from './scripts/makeDatasource.js';
import { Directory } from '../../directory.js';
import { QExpr } from '../../../../lib/index.js';

export const generateQueryResolver = (root: RootNode) => {
  return new TsFile(
    tsg
      .variable('const', 'query', tsg.object(...root.queries.map(makeQuery)))
      .export(),
  ).disableEsLint();
};

const makeResolver = () => tsg.identifier('makeResolver').importFrom('sasat');
const fields = tsg.identifier('fields');

const makeQuery = (node: QueryNode): PropertyAssignment => {
  return tsg.propertyAssign(
    node.queryName,
    makeResolver()
      .call(
        tsg
          .arrowFunc(
            [
              tsg.parameter('_'),
              tsg.parameter(`{${node.args.map(it => it.name).join(',')}}`),
              tsg.parameter('context'),
              tsg.parameter('info'),
            ],
            undefined,
            makeQueryBody(node),
          )
          .toAsync(),
      )
      .typeArgs(
        tsg
          .typeRef('GQLContext')
          .importFrom(Directory.resolve('GENERATED', 'BASE', 'context')),
        tsg.typeLiteral(
          node.args.map(it =>
            tsg.propertySignature(
              it.name,
              tsg.typeRef(
                it.type.entity
                  ? it.type.typeName
                  : columnTypeToTsType(it.type.dbType),
              ),
            ),
          ),
        ),
      ),
  );
};

const makeQueryBody = (node: QueryNode) => {
  if (node.type === 'primary') return makePrimaryQuery(node);
  return tsg.block(...makeListQuery(node));
};

const makePrimaryQuery = (node: QueryNode): TsExpression => {
  return makeDatasource(node.entityName, 'GENERATED')
    .property(node.dsMethodName)
    .call(
      ...node.args.map(it => tsg.identifier(it.name)),
      tsg
        .identifier('gqlResolveInfoToField')
        .importFrom('sasat')
        .call(tsg.identifier('info'))
        .as(makeTypeRef(node.entityName, 'fields', 'GENERATED')),
      tsg.identifier('undefined'),
      tsg.identifier('context'),
    );
};

const makeListQuery = (node: QueryNode) => {
  if (node.pageable) return makeListPagingQuery(node);
  return makeListAllQuery(node);
};

const makeListQueryField = (node: QueryNode) => {
  return tsg.variable(
    'const',
    fields,
    tsg
      .identifier('gqlResolveInfoToField')
      .call(tsg.identifier('info'))
      .typeArgs(makeTypeRef(node.entityName, 'fields', 'GENERATED')),
  );
};

const makeListQueryDataSource = (node: QueryNode) => {
  return makeDatasource(node.entityName, 'GENERATED');
};

const makeListAllQuery = (node: QueryNode) => {
  return [
    makeListQueryField(node),
    tsg.return(
      makeListQueryDataSource(node)
        .property(node.dsMethodName)
        .call(fields, tsg.identifier('undefined'), tsg.identifier('context')),
    ),
  ];
};

const makeListPagingQuery = (node: QueryNode) => {
  const option = tsg.identifier('option');
  const expr = tsg.identifier('QExpr').importFrom('sasat');

  return [
    makeListQueryField(node).addImport(['PagingOption'], 'sasat'),
    tsg.variable(
      'const',
      'sort',
      tsg.ternary(
        option.property('order'),
        tsg.array([
          expr
            .property('sort')
            .call(
              expr
                .property('field')
                .call(tsg.string('t1'), option.property('order')),
              tsg.ternary(
                tsg.binary(
                  tsg.identifier('option?').property('asc'),
                  '===',
                  tsg.identifier('false'),
                ),
                tsg.string('DESC'),
                tsg.string('ASC'),
              ),
            ),
        ]),
        tsg.array([]),
      ),
    ),
    tsg.return(
      makeListQueryDataSource(node)
        .property('findPageable') // todo move
        .call(
          tsg.object(
            tsg.propertyAssign('numberOfItem', option.property('numberOfItem')),
            tsg.propertyAssign('offset', option.property('offset')),
            tsg.propertyAssign('sort'),
          ),
          fields,
          tsg.identifier('undefined'),
          tsg.identifier('context'),
        ),
    ),
  ];
};
