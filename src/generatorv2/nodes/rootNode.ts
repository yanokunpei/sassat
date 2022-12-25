import { EntityNode } from './entityNode.js';
import { QueryNode } from './queryNode.js';
import { MutationNode } from './mutationNode.js';
import { SubscriptionNode } from './subscriptionNode.js';

export type RootNode = {
  entities: EntityNode[];
  queries: QueryNode[];
  mutations: MutationNode[];
  subscriptions: SubscriptionNode[];
};
