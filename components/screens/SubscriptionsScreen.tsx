import { FeedSubscriptionManager, Subscription } from "@pcd/passport-interface";
import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import {
  useSelf,
  useSubscriptions,
  useUserForcedToLogout
} from "../../src/appHooks";
import {
  clearAllPendingRequests,
  pendingViewSubscriptionsRequestKey,
  setPendingViewSubscriptionsRequest
} from "../../src/sessionStorage";
import { useSyncE2EEStorage } from "../../src/useSyncE2EEStorage";
import { Button, H2, Spacer } from "../core";
import { MaybeModal } from "../modals/Modal";
import { AppContainer } from "../shared/AppContainer";
import { SubscriptionNavigation } from "../shared/SubscriptionNavigation";
import { SubscriptionInfoRow } from "./AddSubscriptionScreen";

export function SubscriptionsScreen() {
  useSyncE2EEStorage();
  const { value: subs } = useSubscriptions();
  const self = useSelf();
  const userForcedToLogout = useUserForcedToLogout();

  useEffect(() => {
    if (self == null || userForcedToLogout) {
      clearAllPendingRequests();
      const stringifiedRequest = JSON.stringify("");
      setPendingViewSubscriptionsRequest(stringifiedRequest);
      if (self == null) {
        window.location.href = `/#/login?redirectedFromAction=true&${pendingViewSubscriptionsRequestKey}=${encodeURIComponent(
          stringifiedRequest
        )}`;
      }
    }
  }, [self, userForcedToLogout]);

  const onAddNewClicked = useCallback(() => {
    window.location.href = "/#/add-subscription";
  }, []);

  return (
    <>
      <MaybeModal />
      <AppContainer bg="gray">
        <SubscriptionNavigation label={"Home"} to="/"></SubscriptionNavigation>
        <Container>
          <H2>Your Subscriptions</H2>
          <Spacer h={32} />
          <Button onClick={onAddNewClicked}>Add a new subscription</Button>
          <Spacer h={16} />
          {subs.getActiveSubscriptions().length === 0 && (
            <div>You have no subscriptions.</div>
          )}
          <SubscriptionTree subscriptions={subs} />
        </Container>
      </AppContainer>
    </>
  );
}

function SubscriptionTree({
  subscriptions
}: {
  subscriptions: FeedSubscriptionManager;
}) {
  const byProvider = Array.from(
    subscriptions.getSubscriptionsByProvider().entries()
  );

  return (
    <div>
      {byProvider.map(([providerUrl, subscriptionsList]) => (
        <SingleProvider
          key={providerUrl}
          subscriptions={subscriptions}
          providerUrl={providerUrl}
          subscriptionsList={subscriptionsList}
        />
      ))}
    </div>
  );
}

function SingleProvider({
  subscriptions,
  subscriptionsList,
  providerUrl
}: {
  subscriptions: FeedSubscriptionManager;
  providerUrl: string;
  subscriptionsList: Subscription[];
}) {
  const providerName = subscriptions.getProvider(providerUrl).providerName;
  return (
    <ProviderContainer>
      <ProviderHeader>
        Subscriptions provided by <ProviderName>{providerUrl}</ProviderName>
      </ProviderHeader>
      <Spacer h={8} />
      {subscriptionsList.map((s) => (
        <React.Fragment key={s.id}>
          <Spacer h={16} />
          <SubscriptionInfoRow
            providerUrl={providerUrl}
            providerName={providerName}
            info={s.feed}
            subscriptions={subscriptions}
            showErrors={true}
          />
        </React.Fragment>
      ))}
    </ProviderContainer>
  );
}

const ProviderHeader = styled.div``;

const ProviderName = styled.span`
  font-weight: bold;
`;

const Container = styled.div`
  padding-bottom: 16px;
  padding-top: 16px;
`;

const ProviderContainer = styled.div``;
