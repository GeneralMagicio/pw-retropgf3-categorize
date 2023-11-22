import { GraphQLClient } from "graphql-request";

const whereData = (user) => ({
  AND: [
    {
      schemaId: {
        equals:
          "0xac4c92fc5c7babed88f78a917cdbcdc1c496a8f4ab2d5b2ec29402736b2cf929",
      },
      attester: {
        equals: user,
      },
    },
  ],
});

const query = `
  query Attestations($where: AttestationWhereInput) {
    attestations(where: $where) {
      decodedDataJson
      id
      attester
    }
  }
`;

export async function fetchUserProfiles(user) {
  const client = new GraphQLClient("https://optimism.easscan.org/graphql");
  return client.request(query, { where: whereData(user) });
}
