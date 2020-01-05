import ApolloClient from "apollo-client";
import React from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-hooks";
import { NextPage, NextPageContext } from "next";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-unfetch";
import { getDataFromTree } from "@apollo/react-ssr";

// based on https://git.io/JepyG

const onNode = typeof window === "undefined";

let globalApolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const getApolloClient = (
  initialState?: NormalizedCacheObject
): ApolloClient<NormalizedCacheObject> => {
  if (onNode || !globalApolloClient) {
    const uri = "http://localhost:3001/";
    const cache = new InMemoryCache();
    if (initialState) {
      cache.restore(initialState);
    }
    globalApolloClient = new ApolloClient({
      cache,
      link: new HttpLink({ uri, fetch }),
      ssrMode: onNode
    });
  }

  return globalApolloClient;
};

type ApolloNextPage = NextPage<{
  apolloClient?: ApolloClient<NormalizedCacheObject>;
  apolloCache?: NormalizedCacheObject;
}>;

export const withApollo = (Page: NextPage<{}>): ApolloNextPage => {
  const WithApollo: ApolloNextPage = ({ apolloCache, apolloClient }) => {
    if (!apolloClient) {
      apolloClient = getApolloClient(apolloCache);
    }
    return (
      <ApolloProvider client={apolloClient}>
        <Page />
      </ApolloProvider>
    );
  };

  WithApollo.getInitialProps = async (context: NextPageContext) => {
    const { AppTree } = context;

    const apolloClient = getApolloClient();

    if (onNode && context.res && context.res.finished) {
      return { apolloClient };
    }

    if (onNode) {
      try {
        await getDataFromTree(<AppTree pageProps={{ apolloClient }} />);
      } catch (error) {
        console.error("Error while running `getDataFromTree`", error);
      }

      // because https://git.io/Jep8E says so:
      Head.rewind();
    }

    const apolloCache = apolloClient.cache.extract();

    return { apolloCache };
  };

  return WithApollo;
};
