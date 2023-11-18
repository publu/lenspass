import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useIsSyncSettled } from "../../../src/appHooks";
import { useSyncE2EEStorage } from "../../../src/useSyncE2EEStorage";
import { err } from "../../../src/util";
import { AppContainer } from "../../shared/AppContainer";
import { SyncingPCDs } from "../../shared/SyncingPCDs";
import { AddHaloScreen } from "./AddHaloScreen";

/**
 * Specific landing page for adding a HaloNoncePCD, which in the case of Zupass
 * corresponds to a specific Zuzalu Experience.
 */
export function HaloScreen() {
  useSyncE2EEStorage();
  const syncSettled = useIsSyncSettled();
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);

  const screen = getScreen(params);
  useEffect(() => {
    if (screen === null) {
      err(dispatch, "Unsupported request", `Expected a Halo signature URL`);
    }
  }, [dispatch, screen]);

  if (!syncSettled) {
    return (
      <AppContainer bg="gray">
        <SyncingPCDs />
      </AppContainer>
    );
  }

  if (screen == null) {
    // Need AppContainer to display error
    return <AppContainer bg="gray" />;
  }

  return screen;
}

function getScreen(params: URLSearchParams) {
  const pk2 = params.get("pk2");
  const rnd = params.get("rnd");
  const rndsig = params.get("rndsig");

  if (pk2 == null || rnd == null || rndsig == null) {
    return null;
  } else {
    return <AddHaloScreen pk2={pk2} rnd={rnd} rndsig={rndsig} />;
  }
}
