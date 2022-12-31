/* eslint-disable */
import {
  QExpr,
  BooleanValueExpression,
  RelationMap,
  TableInfo,
  EntityResult,
} from "sasat";
import { UserIdentifiable, User } from "./entities/User.js";
import { PostIdentifiable, Post } from "./entities/Post.js";
import { Stock, StockIdentifiable } from "./entities/Stock.js";
export const relationMap: RelationMap = {
  user: {
    uPost: {
      table: "post",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "userId"),
          QExpr.field(childTableAlias, "userId")
        ),
      relation: "Many",
    },
    stock_userStock: {
      table: "stock",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "userId"),
          QExpr.field(childTableAlias, "user")
        ),
      relation: "Many",
    },
  },
  post: {
    pUser: {
      table: "user",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "userId"),
          QExpr.field(childTableAlias, "userId")
        ),
      relation: "One",
    },
    Stock: {
      table: "stock",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "postId"),
          QExpr.field(childTableAlias, "post")
        ),
      relation: "Many",
    },
  },
  stock: {
    stock_user: {
      table: "user",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "user"),
          QExpr.field(childTableAlias, "user")
        ),
      relation: "One",
    },
    postPost: {
      table: "post",
      on: (
        parentTableAlias: string,
        childTableAlias: string
      ): BooleanValueExpression =>
        QExpr.conditions.eq(
          QExpr.field(parentTableAlias, "post"),
          QExpr.field(childTableAlias, "post")
        ),
      relation: "One",
    },
  },
};
export const tableInfo: TableInfo = {
  user: {
    identifiableKeys: ["userId"],
    columnMap: {
      uid: "userId",
      NNN: "name",
      nick: "nickName",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  post: {
    identifiableKeys: ["postId"],
    columnMap: { userId: "userId", pid: "postId", title: "title" },
  },
  stock: {
    identifiableKeys: ["id"],
    columnMap: {
      user: "user",
      post: "post",
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
};
export type UserRelations = {
  uPost: Array<EntityResult<UserWithRelations, UserIdentifiable>>;
  stock_userStock: Array<EntityResult<UserWithRelations, UserIdentifiable>>;
};
export type UserWithRelations = User & UserRelations;
export type UserResult = EntityResult<UserWithRelations, UserIdentifiable>;
export type PostRelations = {
  pUser: EntityResult<UserWithRelations, UserRelations>;
  Stock: Array<EntityResult<PostWithRelations, PostIdentifiable>>;
};
export type PostWithRelations = Post & PostRelations;
export type PostResult = EntityResult<PostWithRelations, PostIdentifiable>;
export type StockRelations = {
  stock_user: EntityResult<UserWithRelations, UserRelations>;
  postPost: EntityResult<PostWithRelations, PostRelations>;
};
export type StockWithRelations = Stock & StockRelations;
export type StockResult = EntityResult<StockWithRelations, StockIdentifiable>;
