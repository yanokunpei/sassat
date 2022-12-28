import { EntityName } from '../../parser/node/entityName.js';
import { DBColumnTypes } from '../../migration/column/columnTypes.js';
import { GqlPrimitive } from '../../generator/gql/types.js';

export type EntityNode = {
  name: EntityName;
  gqlEnabled: boolean;
  fields: FieldNode[];
  references: ReferenceTypeNode[];
  referencedBy: ReferenceTypeNode[];
  creatable: SubTypeNode;
  updateInput: SubTypeNode;
};

export type SubTypeNode = {
  gqlEnabled: boolean;
  fields: FieldNode[];
};

export type FieldNode = {
  name: string;
  gqlType: GqlPrimitive | string;
  dbType: DBColumnTypes;
  isNullable: boolean;
  isArray: boolean;
  isPrimary: boolean;
  isUpdatable: boolean;
  isGQLOpen: boolean;
};

export type ReferenceTypeNode = {
  entity: EntityName;
  isGQLOpen: boolean;
  isNullable: boolean;
  isArray: boolean;
  isPrimary: boolean;
};
