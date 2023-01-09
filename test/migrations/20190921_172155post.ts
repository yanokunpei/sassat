import { MigrationStore, SasatMigration, Conditions } from '../../src/index.js';
// import {Conditions} from "../../src";

export default class Post implements SasatMigration {
  up: (store: MigrationStore) => void = store => {
    return store.createTable('post', table => {
      table
        .column('postId')
        .int()
        .unsigned()
        .autoIncrement()
        .primary()
        .fieldName('pid');
      table.references({
        columnName: 'uId',
        relationName: 'hoge',
        parentColumn: 'userId',
        parentTable: 'user',
        parentFieldName: 'uPost',
        fieldName: 'pUser',
        relation: 'Many',
      });
      table.column('title').varchar(50).notNull();
      table.enableGQL().setGQLOption({ query: { find: true, list: 'paging' } });
      table.setGQLCreate(true).setGQLUpdate(true).setGQLContextColumn([]);
      table.addVirtualRelation({
        parentTable: 'user',
        parentFieldName: 'vP',
        childFieldName: 'vC',
        parentType: 'array',
        conditions: [
          // {
          //   left: { type: 'parent', field: 'uid' },
          //   right: {
          //     type: 'context',
          //     field: 'vv',
          //     // onNotDefined: { action: 'error', message: 'aaaaaaww' },
          //     onNotDefined: { action: 'defaultValue', value: 'ww' },
          //   },
          //   operator: '=',
          // },
          Conditions.custom('hoge', undefined, ['userId']),
          Conditions.between(
            Conditions.value.parent('createdAt'),
            Conditions.range.today(),
          ),
        ],
      });
    });
  };
  down: (store: MigrationStore) => void = store => {
    store.dropTable('post');
  };
}
