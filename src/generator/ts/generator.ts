import { CodeGenerator } from '../generator';
import * as prettier from 'prettier';
import { IrGql } from '../../ir/gql';
import { generateTsTypeDef } from './gql/typeDef';
import { generateTsGqlQueryString } from './gql/query';
import { TsCodeGeneratorGqlMutation } from './gql/mutation';
import { IrGqlContext } from '../../ir/gql/context';
import { TsGeneratorGqlContext } from './gql/context';
import { TsGeneratorGqlResolver } from './gql/resolver';
import { TsGeneratorGqlSubscription } from './gql/subscription';
import { EntityNode } from '../../node/entity';
import { TsEntityGenerator } from './v2/entity';
import { GeneratedRepositoryGenerator } from './v2/generatedRepository';
import { RepositoryNode } from '../../node/repository';
import { generateRepositoryString } from './v2/repository';

export class TsCodeGenerator implements CodeGenerator {
  readonly fileExt = 'ts';

  private formatCode(code: string) {
    return prettier.format(code, { parser: 'typescript' });
  }

  generateEntity(entity: EntityNode): string {
    return new TsEntityGenerator(entity).generate().toString();
  }

  generateGeneratedRepository(repository: RepositoryNode): string {
    return new GeneratedRepositoryGenerator(repository).generate().toString();
  }

  generateRepository(repository: RepositoryNode): string {
    return this.formatCode(generateRepositoryString(repository));
  }

  generateGqlTypeDefs(gql: IrGql): string {
    return this.formatCode(generateTsTypeDef(gql));
  }

  generateGqlQuery(gql: IrGql): string {
    return this.formatCode(generateTsGqlQueryString(gql));
  }

  generateGqlResolver(gql: IrGql): string {
    return this.formatCode(new TsGeneratorGqlResolver(gql.resolvers).generate());
  }

  generateGqlMutation(gql: IrGql): string {
    return this.formatCode(new TsCodeGeneratorGqlMutation(gql).generate());
  }

  generateGqlSubscription(gql: IrGql): string {
    return this.formatCode(new TsGeneratorGqlSubscription(gql.mutations).generate());
  }

  generateGqlContext(contexts: IrGqlContext[]): string {
    return this.formatCode(new TsGeneratorGqlContext(contexts).generate());
  }

  generateOnceFiles(): Array<{ name: string; body: string }> {
    const contextFile = `\
import { BaseGqlContext } from './__generated__/context';
export interface GqlContext extends BaseGqlContext {}
`;
    const pubsubFile = `\
import { PubSub } from "apollo-server";
import { PubSubEngine } from "graphql-subscriptions";

export const pubsub: PubSubEngine = new PubSub();
`;
    const schemaFile = `\
import { assignDeep, createTypeDef } from "sasat";
import { typeDef } from "./__generated__/typeDefs";
import { resolvers } from "./__generated__/resolver";

export const schema = {
  typeDefs: createTypeDef(assignDeep(typeDef, {})),
  resolvers: assignDeep(resolvers, {}),
};

`;
    return [
      {
        name: 'context',
        body: contextFile,
      },
      {
        name: 'pubsub',
        body: pubsubFile,
      },
      {
        name: 'schema',
        body: schemaFile,
      },
    ];
  }
}
