/* eslint-disable */
export const typeDefs = {
  User: {
    userId: { return: "ID!" },
    NNN: { return: "String!" },
    nick: { return: "String" },
    createdAt: { return: "String!" },
    updatedAt: { return: "String!" },
    uPost: { return: "[Post!]!" },
    vP: { return: "[Post!]!" },
  },
  Post: {
    pid: { return: "Int!" },
    uId: { return: "Int!" },
    title: { return: "String!" },
    pUser: { return: "User!" },
    vC: { return: "[User!]!" },
  },
  Query: {
    user: { return: "User", args: [{ name: "userId", type: "ID!" }] },
    users: {
      return: "[User!]!",
      args: [{ name: "option", type: "PagingOption!" }],
    },
    www: { return: "User", args: [{ name: "a1", type: "Int!" }] },
    la: { return: "[User!]!", args: [] },
    p: {
      return: "[User!]!",
      args: [{ name: "option", type: "PagingOption!" }],
    },
    post: { return: "Post", args: [{ name: "pid", type: "Int!" }] },
    posts: {
      return: "[Post!]!",
      args: [{ name: "option", type: "PagingOption!" }],
    },
    stock: { return: "Stock", args: [{ name: "id", type: "Int!" }] },
    stocks: { return: "[Stock!]!", args: [] },
  },
  Mutation: {
    createUser: {
      return: "User!",
      args: [{ name: "user", type: "UserCreateInput!" }],
    },
    updateUser: {
      return: "Boolean!",
      args: [{ name: "user", type: "UserUpdateInput!" }],
    },
    createPost: {
      return: "Post!",
      args: [{ name: "post", type: "PostCreateInput!" }],
    },
    updatePost: {
      return: "Post!",
      args: [{ name: "post", type: "PostUpdateInput!" }],
    },
  },
  Subscription: {
    UserCreated: { return: "User!", args: [] },
    UserUpdated: { return: "User!", args: [{ name: "name", type: "String!" }] },
  },
};
export const inputs = {
  PagingOption: {
    numberOfItem: { return: "Int!" },
    offset: { return: "Int" },
    order: { return: "String" },
    asc: { return: "Boolean" },
  },
  UserCreateInput: { NNN: { return: "String" }, nick: { return: "String" } },
  PostCreateInput: { uId: { return: "Int!" }, title: { return: "String!" } },
  UserUpdateInput: {
    userId: { return: "ID!" },
    NNN: { return: "String" },
    nick: { return: "String" },
  },
  PostUpdateInput: { pid: { return: "Int!" }, title: { return: "String" } },
};
