import { FrogCryptoFolderName } from "@pcd/passport-interface";
import { splitPath } from "@pcd/pcd-collection";
import { sleep } from "@pcd/util";
import validator from "email-validator";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import { Dispatcher } from "./dispatch";

export function assertUnreachable(_: never): never {
  throw new Error("Unreachable");
}

export function getHost(returnURL: string) {
  const url = new URL(returnURL);
  return url.host;
}

export function getOrigin(returnURL: string) {
  const url = new URL(returnURL);
  return url.origin;
}

export async function nextFrame() {
  await sleep(50);
}

export function err(dispatch: Dispatcher, title: string, message: string) {
  dispatch({
    type: "error",
    error: { title, message }
  });
}

export function uuidToBigint(uuid: string): bigint {
  return BigInt("0x" + uuid.replace(/-/g, ""));
}

export function bigintToUuid(bigint: bigint): string {
  const hex = bigint.toString(16).padStart(32, "0");
  return (
    hex.slice(0, 8) +
    "-" +
    hex.slice(8, 12) +
    "-" +
    hex.slice(12, 16) +
    "-" +
    hex.slice(16, 20) +
    "-" +
    hex.slice(20)
  );
}

export function randomEmail() {
  return uuid().slice(0, 8) + "@test.com";
}

export function validateEmail(email: string): boolean {
  return validator.validate(email);
}

function getVerifyUrlPrefixes(): string[] {
  return [
    `https://www.lenspass.xyz/#/verify`,
    `https://zupass.org#/verify`,
    `https://www.lenspass.xyz/#/checkin`,
    `https://zupass.org#/checkin`,
    `https://www.lenspass.xyz/#/checkin-by-id`,
    `https://zupass.org#/checkin-by-id`
  ];
}

// Given an input string, check if there exists a ticket verify URL within it.
// If so, return the last occurance of a verify URL. If not, return null.
export function getLastValidVerifyUrl(inputString: string) {
  const lastValidUrlStartIdx = _.chain(getVerifyUrlPrefixes())
    .map((verifyUrlPrefix) => inputString.lastIndexOf(verifyUrlPrefix))
    .max()
    .value();
  if (lastValidUrlStartIdx !== -1) {
    return inputString.slice(lastValidUrlStartIdx);
  }
  return null;
}

export function maybeRedirect(text: string): string | null {
  if (getVerifyUrlPrefixes().find((prefix) => text.startsWith(prefix))) {
    const hash = text.substring(text.indexOf("#") + 1);
    console.log(`Redirecting to ${hash}`);
    return hash;
  }
  return null;
}

/**
 * Check if a folder path is a FrogCrypto (sub)folder.
 */
export function isFrogCryptoFolder(folderPath: string): boolean {
  const parts = splitPath(folderPath);
  return parts[0] === FrogCryptoFolderName;
}

export function bigintToUint8Array(bigint: bigint): Uint8Array {
  const hex = bigint.toString(16).padStart(64, "0");
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

export function uint8arrayToBigint(uint8Array: Uint8Array): bigint {
  return BigInt("0x" + Buffer.from(uint8Array).toString("hex"));
}
