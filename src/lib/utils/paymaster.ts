import { createPublicClient, http, type Address } from 'viem';
import { gnosis, gnosisChiado } from 'viem/chains';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY as string | undefined;
const CHAIN_NAME = (import.meta.env.VITE_CHAIN as string | undefined) ?? 'chiado';

const chain = CHAIN_NAME === 'gnosis' ? gnosis : gnosisChiado;

const PIMLICO_RPC = PIMLICO_API_KEY
  ? `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_API_KEY}`
  : null;

export const publicClient = createPublicClient({
  chain,
  transport: http(chain.rpcUrls.default.http[0])
});

// Returns a Pimlico paymaster client when API key is configured.
// Used by smart contract calls (Week 8+) to sponsor gas for users.
export function getPimlicoClient() {
  if (!PIMLICO_RPC) return null;
  // ERC-4337 v0.7 EntryPoint (same address across all EVM chains)
  return createPimlicoClient({
    transport: http(PIMLICO_RPC),
    entryPoint: { address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', version: '0.7' }
  });
}

export function isPaymasterEnabled(): boolean {
  return !!PIMLICO_API_KEY;
}

// Build a Pimlico-sponsored user operation for on-chain habit attestations.
// Placeholder until contracts are deployed (Week 8).
export async function sponsorAttestation(params: {
  habitId: string;
  date: string;
  verified: boolean;
  userAddress: Address;
}): Promise<{ sponsored: boolean; txHash?: string }> {
  const pimlico = getPimlicoClient();
  if (!pimlico) {
    return { sponsored: false };
  }

  // Week 8: replace with actual contract calldata + user op submission
  console.info('[paymaster] Pimlico sponsorship ready — contracts TBD in Week 8', params);
  return { sponsored: true };
}
