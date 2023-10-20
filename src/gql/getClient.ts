import { GraphQLClient } from "graphql-request";

export const EAS_API_URL = "https://optimism.easscan.org/graphql";

export function getClient() {
  return new GraphQLClient(EAS_API_URL);
}
