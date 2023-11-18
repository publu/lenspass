import {
  PCDGetWithoutProvingRequest,
  PCDRequestType
} from "@pcd/passport-interface";
import { SemaphoreIdentityPCDTypeName } from "@pcd/semaphore-identity-pcd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  useDispatch,
  useIsSyncSettled,
  usePCDCollection,
  useSelf,
  useUserForcedToLogout
} from "../../src/appHooks";
import { safeRedirect, validateRequest } from "../../src/passportRequest";
import {
  clearAllPendingRequests,
  pendingGetWithoutProvingRequestKey,
  setPendingGetWithoutProvingRequest
} from "../../src/sessionStorage";
import { useSyncE2EEStorage } from "../../src/useSyncE2EEStorage";
import { err } from "../../src/util";
import { Button, H1, Spacer } from "../core";
import { MaybeModal } from "../modals/Modal";
import { AppContainer } from "../shared/AppContainer";
import { AppHeader } from "../shared/AppHeader";
import Select from "../shared/Select";
import { SyncingPCDs } from "../shared/SyncingPCDs";

/**
 * Screen that allows the user to respond to a request from a third
 * party website asking for a particular PCD.
 */
export function GetWithoutProvingScreen() {
  useSyncE2EEStorage();
  const location = useLocation();
  const dispatch = useDispatch();
  const self = useSelf();
  const pcds = usePCDCollection();
  const syncSettled = useIsSyncSettled();
  const params = new URLSearchParams(location.search);
  const request = validateRequest<PCDGetWithoutProvingRequest>(params);
  const filteredPCDs = useMemo(
    () => pcds.getAll().filter((pcd) => pcd.type === request.pcdType),
    [pcds, request.pcdType]
  );
  const options = useMemo(
    () =>
      filteredPCDs.map((pcd) => {
        const pcdPackage = pcds.getPackage(pcd.type);
        return {
          id: pcd.id,
          label: pcdPackage?.getDisplayOptions(pcd)?.displayName ?? pcd.id
        };
      }),
    [filteredPCDs, pcds]
  );

  // If we only have one matching PCD, then make that the default selection
  const defaultSelection =
    filteredPCDs.length === 1 ? filteredPCDs[0].id : "none";
  const [selectedPCDID, setSelectedPCDID] = useState<string>(defaultSelection);

  const onSendClick = useCallback(async () => {
    if (selectedPCDID === undefined) return;
    const pcd = pcds.getById(selectedPCDID);
    const pcdPackage = pcds.getPackage(pcd.type);
    if (pcdPackage === undefined) return;
    const serializedPCD = await pcdPackage.serialize(pcd);
    safeRedirect(request.returnUrl, serializedPCD);
  }, [pcds, request.returnUrl, selectedPCDID]);

  const userForcedToLogout = useUserForcedToLogout();

  useEffect(() => {
    if (self == null || userForcedToLogout) {
      clearAllPendingRequests();
      const stringifiedRequest = JSON.stringify(request);
      setPendingGetWithoutProvingRequest(stringifiedRequest);
      if (self == null) {
        window.location.href = `/#/login?redirectedFromAction=true&${pendingGetWithoutProvingRequestKey}=${encodeURIComponent(
          stringifiedRequest
        )}`;
      }
    }
  }, [request, self, userForcedToLogout]);

  if (request.type !== PCDRequestType.GetWithoutProving) {
    err(
      dispatch,
      "Unsupported request",
      `Expected a PCD GetWithoutProving request`
    );
    return null;
  }

  if (request.pcdType === SemaphoreIdentityPCDTypeName) {
    err(
      dispatch,
      "Unsupported PCD Type",
      `You cannot request a Semaphore Identity PCD.`
    );
    return null;
  }

  if (self == null) {
    return null;
  }

  if (!syncSettled) {
    return <SyncingPCDs />;
  }

  return (
    <>
      <MaybeModal fullScreen isProveOrAddScreen={true} />
      <AppContainer bg="gray">
        <Container>
          <Spacer h={16} />
          <AppHeader isProveOrAddScreen={true} />
          <Spacer h={16} />
          <H1>Get {request.pcdType}</H1>
          <p>
            This website is requesting a pcd of type {request.pcdType} from your
            Zupass. Choose the one you want to return, and click 'Send' below to
            give it to the website.
          </p>
          <Spacer h={16} />
          <Select
            value={options.find((o) => o.id === selectedPCDID)}
            onChange={(o) => setSelectedPCDID(o.id)}
            options={options}
            noOptionsMessage={() => "No matching PCDs"}
          />
          <Spacer h={16} />
          <Button onClick={onSendClick}>Send</Button>
        </Container>
      </AppContainer>
    </>
  );
}

const Container = styled.div`
  padding: 16px;
  width: 100%;
  max-width: 100%;
`;
