import { DBColumnTypes } from '../../../migration/column/columnTypes.js';
import { GqlPrimitive } from '../../../generator/gql/types.js';

export type TypeNode = {
  gqlEnabled: boolean;
  fields: FieldNode[];
  references: ReferenceTypeNode[];
  referencedBy: ReferenceTypeNode[];
};

export type FieldNode = {
  gqlType: GqlPrimitive | string;
  dbType?: DBColumnTypes;
  isNullable: boolean;
  isArray: boolean;
  requiredOnCreate: boolean;
};

export type ReferenceTypeNode = {
  entity: string;
  gqlEnabled: boolean;
  field: FieldNode;
};
