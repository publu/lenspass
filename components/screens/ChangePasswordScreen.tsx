import { HexString, PCDCrypto } from "@pcd/passport-crypto";
import { requestPasswordSalt } from "@pcd/passport-interface";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appConfig } from "../../src/appConfig";
import {
  useDispatch,
  useHasSetupPassword,
  useSelf,
  useUpdate
} from "../../src/appHooks";
import { loadEncryptionKey } from "../../src/localstorage";
import { setPassword } from "../../src/password";
import { CenterColumn, H2, HR, Spacer, TextCenter } from "../core";
import { LinkButton } from "../core/Button";
import { RippleLoader } from "../core/RippleLoader";
import { MaybeModal } from "../modals/Modal";
import { AppContainer } from "../shared/AppContainer";
import { NewPasswordForm } from "../shared/NewPasswordForm";
import { PasswordInput } from "../shared/PasswordInput";

export function ChangePasswordScreen() {
  const self = useSelf();
  const hasSetupPassword = useHasSetupPassword();
  // We want the `isChangePassword` state to persist on future renders,
  // otherwise we may show the invalid copy on the "finished" screen
  // after a password is set for the first time.
  const [isChangePassword] = useState(hasSetupPassword);
  const dispatch = useDispatch();
  const update = useUpdate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revealPassword, setRevealPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (self == null) {
      navigate("/login", { replace: true });
    }
  }, [self, navigate]);

  const onChangePassword = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      let currentEncryptionKey: HexString;
      if (!isChangePassword) {
        currentEncryptionKey = loadEncryptionKey();
      } else {
        const saltResult = await requestPasswordSalt(
          appConfig.zupassServer,
          self.email
        );

        if (!saltResult.success) {
          throw new Error("Error occurred while fetching salt from server");
        }

        const crypto = await PCDCrypto.newInstance();
        currentEncryptionKey = await crypto.argon2(
          currentPassword,
          saltResult.value
        );
      }
      await setPassword(newPassword, currentEncryptionKey, dispatch, update);

      setFinished(true);

      setLoading(false);
    } catch (e) {
      console.log("error changing password", e);
      setLoading(false);
      setError(e.message);
    }
  }, [
    currentPassword,
    newPassword,
    dispatch,
    update,
    loading,
    self.email,
    isChangePassword
  ]);

  let content = null;

  if (loading) {
    content = (
      <>
        <Spacer h={128} />
        <RippleLoader />
        <Spacer h={24} />
        <TextCenter>
          {isChangePassword ? "Changing" : "Adding"} your password...
        </TextCenter>
      </>
    );
  } else if (finished) {
    content = (
      <TextCenter>
        <H2>{isChangePassword ? "Changed" : "Added"} Password</H2>
        <Spacer h={24} />
        You've {isChangePassword ? "changed" : "added"} your password
        successfully.
        <Spacer h={24} />
        <LinkButton to={"/"} $primary={true}>
          Done
        </LinkButton>
      </TextCenter>
    );
  } else {
    content = (
      <>
        <TextCenter>
          <H2>{isChangePassword ? "Change" : "Add"} Password</H2>
          <Spacer h={24} />
          Make sure that your {isChangePassword ? "new" : ""} password is
          secure, unique, and memorable. If you forget your password, you'll
          have to reset your account, and you will lose access to all your PCDs.
        </TextCenter>
        <Spacer h={24} />
        {isChangePassword && (
          <>
            <PasswordInput
              placeholder="Current password"
              autoFocus
              revealPassword={revealPassword}
              setRevealPassword={setRevealPassword}
              value={currentPassword}
              setValue={setCurrentPassword}
            />
            <Spacer h={8} />
          </>
        )}
        <NewPasswordForm
          autoFocus={!isChangePassword}
          error={error}
          setError={setError}
          passwordInputPlaceholder={
            isChangePassword ? "New password" : "Password"
          }
          email={self.email}
          revealPassword={revealPassword}
          setRevealPassword={setRevealPassword}
          submitButtonText="Confirm"
          password={newPassword}
          confirmPassword={confirmPassword}
          setPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          onSuccess={onChangePassword}
        />
        <Spacer h={24} />
        <HR />
        <Spacer h={24} />
        <LinkButton to={"/"}>Cancel</LinkButton>
        {/* Add spacing to bottom for iOS keyboard */}
        <Spacer h={512} />
      </>
    );
  }
  return (
    <>
      <MaybeModal />
      <AppContainer bg="gray">
        <Spacer h={64} />
        <CenterColumn>{content}</CenterColumn>
      </AppContainer>
    </>
  );
}
