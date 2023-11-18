import {
  EdDSATicketPCD,
  TicketCategory,
  isEdDSATicketPCD
} from "@pcd/eddsa-ticket-pcd";
import { ZUCONNECT_23_DAY_PASS_PRODUCT_ID } from "@pcd/passport-interface";
import { PCD } from "@pcd/pcd-types";
import React, { useCallback, useContext, useMemo } from "react";
import styled from "styled-components";
import { usePCDCollection } from "../../src/appHooks";
import { StateContext } from "../../src/dispatch";
import { usePackage } from "../../src/usePackage";
import { Button, H4, Spacer, TextCenter } from "../core";
import { MainIdentityCard } from "./MainIdentityCard";
import { DevconnectCardBody } from "./cards/DevconnectTicket";
import { ZKTicketPCDCard } from "./cards/ZKTicket";

export const PCDCard = React.memo(PCDCardImpl);

/**
 * Shows a card representing a PCD in Zupass. If expanded, the full card, otherwise
 * just the top of the card to allow stacking.
 */
function PCDCardImpl({
  isMainIdentity,
  pcd,
  expanded,
  onClick,
  hideRemoveButton
}: {
  pcd: PCD;
  expanded?: boolean;
  isMainIdentity?: boolean;
  onClick?: (id: string) => void;
  hideRemoveButton?: boolean;
}) {
  const clickHandler = useCallback(() => {
    onClick(pcd.id);
  }, [onClick, pcd.id]);

  if (expanded) {
    return (
      <CardContainerExpanded>
        <CardOutlineExpanded>
          <CardHeader>
            <HeaderContent pcd={pcd} isMainIdentity={isMainIdentity} />
          </CardHeader>
          <CardBodyContainer>
            <CardBody pcd={pcd} isMainIdentity={isMainIdentity} />
            {!hideRemoveButton && (
              <CardFooter pcd={pcd} isMainIdentity={isMainIdentity} />
            )}
          </CardBodyContainer>
        </CardOutlineExpanded>
      </CardContainerExpanded>
    );
  }

  return (
    <CardContainerCollapsed onClick={clickHandler}>
      <CardOutlineCollapsed>
        <CardHeaderCollapsed>
          <HeaderContent pcd={pcd} isMainIdentity={isMainIdentity} />
        </CardHeaderCollapsed>
      </CardOutlineCollapsed>
    </CardContainerCollapsed>
  );
}

function HeaderContent({
  pcd,
  isMainIdentity
}: {
  pcd: PCD;
  isMainIdentity: boolean;
}) {
  const pcdPackage = usePackage(pcd);

  const displayOptions = useMemo(() => {
    if (pcdPackage?.getDisplayOptions) {
      return pcdPackage?.getDisplayOptions(pcd);
    }
  }, [pcd, pcdPackage]);

  let header;
  if (isMainIdentity) {
    header = "ZUPASS IDENTITY";
  } else if (displayOptions?.header) {
    header = displayOptions.header.toUpperCase();
  }

  if (
    isEdDSATicketPCD(pcd) &&
    pcd.claim.ticket.ticketCategory === TicketCategory.ZuConnect &&
    pcd.claim.ticket.productId === ZUCONNECT_23_DAY_PASS_PRODUCT_ID
  ) {
    header = "ZUCONNECT '23 DAY PASS";
  }

  const headerContent = header ? (
    <>{header}</>
  ) : (
    pcdPackage?.renderCardBody({ pcd, returnHeader: true })
  );

  return headerContent;
}

const CardFooter = React.memo(CardFooterImpl);

function CardFooterImpl({
  pcd,
  isMainIdentity
}: {
  pcd: PCD;
  isMainIdentity: boolean;
}) {
  const { dispatch } = useContext(StateContext);

  const onRemoveClick = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to remove this PCD? It will be permanently deleted!"
      )
    ) {
      dispatch({ type: "remove-pcd", id: pcd.id });
    }
  }, [pcd, dispatch]);

  if (isMainIdentity) {
    return null;
  }

  return (
    <FooterContainer>
      <Button style="danger" size="small" onClick={onRemoveClick}>
        Remove
      </Button>
    </FooterContainer>
  );
}

function TicketCardBody({ pcd }: { pcd: EdDSATicketPCD }) {
  if (pcd.claim.ticket.ticketCategory === TicketCategory.Devconnect) {
    return <DevconnectCardBody pcd={pcd} />;
  }

  return <ZKTicketPCDCard pcd={pcd} />;
}

function CardBody({
  pcd,
  isMainIdentity
}: {
  pcd: PCD;
  isMainIdentity: boolean;
}) {
  const pcdCollection = usePCDCollection();

  if (isMainIdentity) {
    return <MainIdentityCard />;
  }

  if (
    isEdDSATicketPCD(pcd) &&
    (pcd.claim.ticket.ticketCategory === TicketCategory.Devconnect ||
      pcd.claim.ticket.ticketCategory === TicketCategory.ZuConnect)
  ) {
    return <TicketCardBody pcd={pcd} />;
  }

  if (pcdCollection.hasPackage(pcd.type)) {
    const pcdPackage = pcdCollection.getPackage(pcd.type);
    if (pcdPackage.renderCardBody) {
      const Component = pcdPackage.renderCardBody;
      return <Component pcd={pcd} />;
    }
  }

  return (
    <>
      <TextCenter>
        {pcd.type} unsupported <br />
        no implementation of a ui for this type of card found
      </TextCenter>
      <Spacer h={16} />
    </>
  );
}

export const CardContainerExpanded = styled.div`
  width: 100%;
  padding: 8px;
`;

const CardContainerCollapsed = styled(CardContainerExpanded)`
  cursor: pointer;
  padding: 12px 8px;
`;

export const CardOutlineExpanded = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--accent-dark);
  background: var(--primary-dark);
  overflow: hidden;
`;

const CardOutlineCollapsed = styled.div`
  width: 100%;
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--primary-lite);
  color: var(--primary-lite);
  border-bottom: none;

  :hover {
    opacity: 0.9;
  }
`;

const CardHeaderCollapsed = styled.div`
  user-select: none;
  text-align: center;
  font-size: 16px;
  padding: 8px;
`;

export const CardHeader = styled(H4)`
  text-align: center;
  padding: 10px;
`;

const FooterContainer = styled.div`
  padding: 0px 16px 16px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const CardBodyContainer = styled.div`
  background-color: white;
  color: var(--bg-dark-primary);
`;
