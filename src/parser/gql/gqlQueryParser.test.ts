import { testStoreHandler } from '../../../test/testDataStore';
import { TableHandler } from '../../entity/table';
import { QueryParser } from './gqlQueryParser';

describe('GqlQueryParser', () => {
  const parser = new QueryParser();
  const post = testStoreHandler.table('post') as TableHandler;
  it('listQuery', () => {
    expect(parser['listQuery']([post])).toStrictEqual([
      {
        entity: 'Post',
        isArray: true,
        isNullable: false,
        params: [],
        queryName: 'posts',
        queryType: 0,
        repositoryFunctionName: 'list',
      },
    ]);
  });

  it('primaryQuery', () => {
    expect(parser['primaryQuery']([post])).toStrictEqual([
      {
        entity: 'Post',
        isArray: false,
        isNullable: true,
        params: [
          {
            isArray: false,
            isNullable: false,
            isReference: false,
            name: 'postId',
            type: 'Int',
          },
        ],
        queryName: 'post',
        queryType: 1,
        repositoryFunctionName: 'findByPostId',
      },
    ]);
  });
});
