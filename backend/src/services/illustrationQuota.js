export const ILLUSTRATION_QUOTA = 3;
// Called while holding the generation lock. Existing balances are never topped up.
export async function ensureIllustrationQuota(tx, invitationId) {
 const wallet = await tx.illustrationWallet.findUnique({where:{invitationId}});
 if (wallet?.granted) return wallet;
 const used = await tx.illustrationGeneration.count({where:{invitationId,refunded:false}});
 const data = {granted:ILLUSTRATION_QUOTA,remaining:Math.max(0,ILLUSTRATION_QUOTA-used)};
 return tx.illustrationWallet.upsert({where:{invitationId},create:{invitationId,...data},update:data});
}
