import { getClient } from "./getClient";

const whereData = {
  schemaId: {
    equals:
      "0x76e98cce95f3ba992c2ee25cef25f756495147608a3da3aa2e5ca43109fe77cc",
  },
};

const query = `
  query Attestations($where: AttestationWhereInput) {
    attestations(where: $where) {
      decodedDataJson
      id
      attester
    }
  }
`;

export async function fetchAllApplications() {
  const client = getClient();
  return client.request(query, { where: whereData });
}
