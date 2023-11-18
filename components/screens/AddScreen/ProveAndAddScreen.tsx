import { PCDProveAndAddRequest } from "@pcd/passport-interface";
import { SerializedPCD } from "@pcd/pcd-types";
import { ReactNode, useCallback, useState } from "react";
import styled from "styled-components";
import { useDispatch, useIsSyncSettled } from "../../../src/appHooks";
import { safeRedirect } from "../../../src/passportRequest";
import { H2, Spacer } from "../../core";
import { MaybeModal } from "../../modals/Modal";
import { AddedPCD } from "../../shared/AddedPCD";
import { AppContainer } from "../../shared/AppContainer";
import { AppHeader } from "../../shared/AppHeader";
import { SyncingPCDs } from "../../shared/SyncingPCDs";
import { GenericProveSection } from "../ProveScreen/GenericProveSection";

/**
 * Screen that allows the user to prove a new PCD, and then add it to Zupass.
 */
export function ProveAndAddScreen({
  request
}: {
  request: PCDProveAndAddRequest;
}) {
  const syncSettled = useIsSyncSettled();
  const dispatch = useDispatch();
  const [proved, setProved] = useState(false);
  const [serializedPCD, setSerializedPCD] = useState<
    SerializedPCD | undefined
  >();

  const onProve = useCallback(
    async (_: any, serializedPCD: SerializedPCD) => {
      await dispatch({ type: "add-pcds", pcds: [serializedPCD] });
      setProved(true);
      setSerializedPCD(serializedPCD);
    },
    [dispatch]
  );

  let content: ReactNode;

  if (!syncSettled) {
    content = <SyncingPCDs />;
  } else if (!proved) {
    content = (
      <GenericProveSection
        initialArgs={request.args}
        pcdType={request.pcdType}
        onProve={onProve}
      />
    );
  } else {
    content = (
      <AddedPCD
        onCloseClick={() => {
          if (request.returnPCD) {
            safeRedirect(request.returnUrl, serializedPCD);
          } else {
            safeRedirect(request.returnUrl);
          }
        }}
      />
    );
  }

  return (
    <>
      <MaybeModal fullScreen isProveOrAddScreen={true} />
      <AppContainer bg="gray">
        <Container>
          <Spacer h={24} />
          <AppHeader isProveOrAddScreen={true}>
            <H2>
              {request.options.title || `Add and Prove ${request.pcdType}`}
            </H2>
          </AppHeader>
          <Spacer h={16} />
          {content}
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
