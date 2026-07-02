import { CreateNeighborhoodData, CreatePostData, CreatePostVariables, SendMessageData, SendMessageVariables, ListMyPostsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNeighborhood(options?: useDataConnectMutationOptions<CreateNeighborhoodData, FirebaseError, void>): UseDataConnectMutationResult<CreateNeighborhoodData, undefined>;
export function useCreateNeighborhood(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNeighborhoodData, FirebaseError, void>): UseDataConnectMutationResult<CreateNeighborhoodData, undefined>;

export function useCreatePost(options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;
export function useCreatePost(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;

export function useSendMessage(options?: useDataConnectMutationOptions<SendMessageData, FirebaseError, SendMessageVariables>): UseDataConnectMutationResult<SendMessageData, SendMessageVariables>;
export function useSendMessage(dc: DataConnect, options?: useDataConnectMutationOptions<SendMessageData, FirebaseError, SendMessageVariables>): UseDataConnectMutationResult<SendMessageData, SendMessageVariables>;

export function useListMyPosts(options?: useDataConnectQueryOptions<ListMyPostsData>): UseDataConnectQueryResult<ListMyPostsData, undefined>;
export function useListMyPosts(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyPostsData>): UseDataConnectQueryResult<ListMyPostsData, undefined>;
