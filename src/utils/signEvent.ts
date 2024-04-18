const defaultContent =
  "Harap sign event ini untuk memverifikasi kepemilikan pubkey kamu";

export const signEvent = async (content = defaultContent) => {
  if (!window.nostr) {
    console.error("Nggak bisa sign event: Nggak nemuin ekstensi yang kompatibel dengan NIP-07");
    return false;
  }

  const nostrEvent = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content,
  };

  return await window.nostr.signEvent(nostrEvent);
};
