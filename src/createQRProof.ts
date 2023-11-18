import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import {
  SemaphoreSignaturePCD,
  SemaphoreSignaturePCDArgs,
  SemaphoreSignaturePCDPackage
} from "@pcd/semaphore-signature-pcd";
import { Identity } from "@semaphore-protocol/identity";
import { uuidToBigint } from "./util";

export interface QRPayload {
  uuid: string;
  timestamp: number;
}

// Create a PCD proving that we own a given semaphore identity.
export async function createQRProof(
  identity: Identity,
  uuid: string,
  timestamp: number
): Promise<SemaphoreSignaturePCD> {
  const { prove } = SemaphoreSignaturePCDPackage;

  const payload: QRPayload = {
    uuid: uuidToBigint(uuid).toString(),
    timestamp
  };

  const args: SemaphoreSignaturePCDArgs = {
    signedMessage: {
      argumentType: ArgumentTypeName.String,
      value: JSON.stringify(payload)
    },
    identity: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: SemaphoreIdentityPCDPackage.name,
      value: await SemaphoreIdentityPCDPackage.serialize(
        await SemaphoreIdentityPCDPackage.prove({ identity })
      )
    }
  };

  const pcd = await prove(args);
  return pcd;
}
