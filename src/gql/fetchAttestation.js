import { GraphQLClient } from "graphql-request";

const query = `
  query Attestations($where: AttestationWhereInput) {
    attestations(where: $where) {
      decodedDataJson
      id
      attester
      timeCreated
    }
  }
`;

export async function fetchAttestation(uid) {
  const client = new GraphQLClient("https://optimism.easscan.org/graphql");

  const whereData = {
    id: {
      equals: uid,
    },
  };

  return client.request(query, { where: whereData });
}
