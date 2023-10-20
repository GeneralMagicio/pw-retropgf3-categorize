import { getClient } from "./getClient";

const whereData = (user: string) => ({
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

export async function fetchUserProfiles(user: string) {
  const client = getClient();
  return client.request(query, { where: whereData(user) });
}
