import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNeighborhoodData {
  neighborhood_insert: Neighborhood_Key;
}

export interface CreatePostData {
  post: Post_Key;
}

export interface CreatePostVariables {
  title: string;
  description: string;
}

export interface ListMyPostsData {
  posts: ({
    id: UUIDString;
    title: string;
    status: string;
    neighborhood: {
      name: string;
    };
  } & Post_Key)[];
}

export interface Message_Key {
  id: UUIDString;
  __typename?: 'Message_Key';
}

export interface Neighborhood_Key {
  id: UUIDString;
  __typename?: 'Neighborhood_Key';
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface SendMessageData {
  message_insert: Message_Key;
}

export interface SendMessageVariables {
  postId: UUIDString;
  receiverId: UUIDString;
  content: string;
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNeighborhoodRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNeighborhoodData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNeighborhoodData, undefined>;
  operationName: string;
}
export const createNeighborhoodRef: CreateNeighborhoodRef;

export function createNeighborhood(): MutationPromise<CreateNeighborhoodData, undefined>;
export function createNeighborhood(dc: DataConnect): MutationPromise<CreateNeighborhoodData, undefined>;

interface CreatePostRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
  operationName: string;
}
export const createPostRef: CreatePostRef;

export function createPost(vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;
export function createPost(dc: DataConnect, vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;

interface SendMessageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SendMessageVariables): MutationRef<SendMessageData, SendMessageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SendMessageVariables): MutationRef<SendMessageData, SendMessageVariables>;
  operationName: string;
}
export const sendMessageRef: SendMessageRef;

export function sendMessage(vars: SendMessageVariables): MutationPromise<SendMessageData, SendMessageVariables>;
export function sendMessage(dc: DataConnect, vars: SendMessageVariables): MutationPromise<SendMessageData, SendMessageVariables>;

interface ListMyPostsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyPostsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyPostsData, undefined>;
  operationName: string;
}
export const listMyPostsRef: ListMyPostsRef;

export function listMyPosts(options?: ExecuteQueryOptions): QueryPromise<ListMyPostsData, undefined>;
export function listMyPosts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyPostsData, undefined>;

