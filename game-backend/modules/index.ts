import { PartnerNFT2, PartnerNFT1 } from "./game/image";
import axios from "axios";
import * as FormData from "form-data";

const prisma = require("../../prisma");

const getPartnerKey = (network: string) => {
  if (network === "ton") {
    return process.env.MODE === "dev" ? 'e10de095718c462a812aede3bf4d6710' : '6f05e0c632a44bb59983b3951447a795';
  } else if (network === "botchain") {
    return process.env.MODE === "dev" ? 'ef6e3c5aca284c24a8b9654df828a4b2' : '6f05e0c632a44bb59983b3951447a795';
  }
  throw new Error(`${network} does not support`);
}

export const partnerMint = async (account: any, { order_id, address, network, type_nft = 0 }, accessToken: string) => {
  if (!account.id || isNaN(account.id)) {
    return { error: "User id incorrect" };
  }
  if (!order_id) {
    return { error: "Order id incorrect" };
  }
  if (!accessToken || typeof accessToken !== 'string') {
    return { error: 'access-token header is not set' };
  }
  if (!network) {
    return { error: 'network incorrect' };
  }
  const gameReferralCount = await prisma.game_referral_nfts.count({
    where: { chain: network }
  });
  if (gameReferralCount == 1000) {
    return { error: 'NFT mint is closed — limited supply is fully distributed.' };
  }
  let nfts: any;
  const gameReferral = await prisma.game_referral_nfts.findFirst({
    where: { chain: network, game_user_id: account.id }
  });
  if (gameReferral) {
    return { error: 'Game referral already minted' };
  }
  const partnerKey = getPartnerKey(network);
  try {
    const matches = type_nft === 0 ? PartnerNFT1.match(/^data:(.+);base64,(.+)$/) : PartnerNFT2.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return { error: "Invalid NFT data" };
    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, "base64");
    const form = new FormData();
    form.append("name", "Partner NFT");
    form.append("order_id", order_id);
    form.append("network", network);
    form.append("address", address);
    form.append("additional_metadata", JSON.stringify({
      user_id: account.id
    }));
    form.append("image", imageBuffer, {
      filename: "nft.png",
      contentType: mimeType,
    });
    const res = await axios.post(`${process.env.API_BASE_HOST}/collections/open/${partnerKey}/mint`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${accessToken}`
      }
    });
    nfts = res.data.data;
  } catch (err) {
    return { error: 'mint error' }
  }
  if (!Array.isArray(nfts)) {
    return { error: "nft incorrect" };
  }
  await prisma.game_referral_nfts.create({
    data: {
      game_user_id: account.id,
      address: nfts[0].address,
      chain: network
    }
  });
  return { success: true }
};
