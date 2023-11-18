export function makeEncodedVerifyLink(encodedPCD: string): string {
  const link = `https://zupass.org/#/verify?pcd=${encodeURIComponent(
    encodedPCD
  )}`;
  return link;
}
