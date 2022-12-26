import { ArgNode, TypeNode } from './typeNode.js';
import { EntityName } from '../../parser/node/entityName.js';

export type MutationType = 'create' | 'delete' | 'update';

export type MutationNode = {
  mutationName: string;
  identifyKeys: string[];
  entityName: EntityName;
  returnType: TypeNode;
  args: ArgNode[];
  mutationType: MutationType;
  enableSubscription: boolean;
  refetch: boolean;
};
