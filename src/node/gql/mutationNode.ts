import { IrGqlParam } from '../../ir/gql/types';
import { ContextParamNode } from './contextParamNode';
import { SubscriptionNode } from './subscriptionNode';
import { SubscriptionFilterNode } from './subscriptionFilterNode';
import { EntityName } from '../../entity/entityName';

export class MutationFunctionNode {
  constructor(readonly enabled: boolean, readonly params: IrGqlParam[], readonly subscribed: boolean) {}
}

export class MutationNode {
  constructor(
    readonly entityName: EntityName,
    readonly primaryKeys: string[],
    readonly onCreate: MutationFunctionNode,
    readonly onUpdate: MutationFunctionNode,
    readonly onDelete: MutationFunctionNode,
    readonly contextParams: ContextParamNode[],
    readonly subscriptionFilters: SubscriptionFilterNode[],
  ) {}
}
