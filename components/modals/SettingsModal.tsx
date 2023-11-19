import { useCallback } from "react";
import { useDispatch, useHasSetupPassword, useSelf } from "../../src/appHooks";
import { Button, CenterColumn, Spacer, TextCenter } from "../core";
import { LinkButton } from "../core/Button";
import { icons } from "../icons";
import {
  useProfile,
  usePublications,
  Profile,
  LimitType,
  PublicationType,
  useLogin,
  useProfiles,
  useFollow
} from '@lens-protocol/react-web';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

export function SettingsModal({
  isProveOrAddScreen
}: {
  isProveOrAddScreen: boolean;
}) {
  const dispatch = useDispatch();
  const self = useSelf();
  const hasSetupPassword = useHasSetupPassword();

  const close = useCallback(() => {
    dispatch({ type: "set-modal", modal: { modalType: "none" } });
  }, [dispatch]);

  const clearZupass = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      dispatch({ type: "reset-passport" });
    }
  }, [dispatch]);
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { execute: login, data } = useLogin()
  const { execute: follow } = useFollow();
  const { data: ownedProfiles } = useProfiles({
    where: {
      ownedBy: [address || ''],
    },
  })

  return (
    <>
      <TextCenter>
        <img
          draggable="false"
          src={icons.settingsPrimary}
          width={34}
          height={34}
        />
        <TextCenter>{self.uuid}</TextCenter>

      </TextCenter>
      <Spacer h={24} />
      <CenterColumn>
        <TextCenter>{self.email}</TextCenter>
        <Spacer h={16} />
        {!isProveOrAddScreen && (
          <>
            <LinkButton $primary={true} to="/scan">
              Scan Ticket
            </LinkButton>
            <Spacer h={16} />
            <LinkButton $primary={true} to="/change-password" onClick={close}>
              {hasSetupPassword ? "Change" : "Add"} Password
            </LinkButton>
            <Spacer h={16} />
          </>
        )}
        {
          !isConnected && (
            <Button onClick={() => { open(); close(); }}>
              Connect Wallet
            </Button>
          )
        }
        {
          localStorage.getItem('lens.production.wallets') ? (
            <Button disabled>
              Already connected to Lens
            </Button>
          ) : (
            !data && ownedProfiles?.length && isConnected && (
              <Button onClick={() => {
                login({
                  address: address || '',
                  profileId: ownedProfiles[ownedProfiles.length - 1].id
                });
                close();
              }}>
                Login with Lens
              </Button>
            )
          )
        }
      <Spacer h={24} />
        <Button onClick={clearZupass} style="danger">
          Log Out
        </Button>
      </CenterColumn>
    </>
  );
}
