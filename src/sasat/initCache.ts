import {
  SasatRedisCacheConfHash,
  SasatRedisCacheConfJSONString,
  SasatRedisCacheConfString,
  RedisDBCacheTypeNames,
  SasatRedisCacheType,
} from './redisCacheConf';
import { DBClient } from '../db/dbClient';
import { RedisClient } from '../redis/redisClient';

export const initCache = async (
  db: DBClient,
  redis: RedisClient,
  initCachesInfo: SasatRedisCacheType[],
): Promise<void> => {
  const stringCache = (
    conf: SasatRedisCacheConfString,
    records: Array<{ [key: string]: string }>,
  ): Promise<Array<'OK'>> =>
    Promise.all(records.map(record => redis.set(`${conf.keyPrefix}${record[conf.key]}`, record[conf.value])));

  const jsonCache = (
    conf: SasatRedisCacheConfJSONString,
    records: Array<{ [key: string]: string }>,
  ): Promise<Array<'OK'>> =>
    Promise.all(records.map(record => redis.set('' + conf.keyPrefix + record[conf.key], JSON.stringify(record))));

  const hashCache = (conf: SasatRedisCacheConfHash, records: Array<{ [key: string]: string }>): Promise<Array<'OK'>> =>
    Promise.all(
      records.map(record => {
        const fieldValues = Object.entries(record).reduce((prev: string[], cur: string[]) => [...cur, ...prev], []);
        return redis.hmset('' + conf.keyPrefix + record[conf.key], ...fieldValues);
      }),
    );

  await Promise.all(
    initCachesInfo.map((it: SasatRedisCacheType) => {
      const columns = it.type === RedisDBCacheTypeNames.String ? [it.value] : it.values;
      return db.query`select ${() => [it.key, ...columns].join(',')} from ${() => it.table}`.then(res => {
        if (it.type === RedisDBCacheTypeNames.String) return stringCache(it, res);
        if (it.type === RedisDBCacheTypeNames.JSONString) return jsonCache(it, res);
        if (it.type === RedisDBCacheTypeNames.Hash) return hashCache(it, res);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`incorrect type ${(it as any).type}`);
      });
    }),
  );
};
