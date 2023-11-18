import { User } from "@pcd/passport-interface";
import Avatar from "boring-avatars";
import styled from "styled-components";
import { useSelf } from "../../src/appHooks";
import { Spacer, TextCenter } from "../core";

export function MainIdentityCard({ user }: { user?: User }) {
  const self = useSelf();
  const actualUser = user ?? self;

  return (
    <CardBody>
      <Spacer h={24} />
      <TextCenter>
        <Avatar
          size={300}
          variant="bauhaus"
          name={actualUser.uuid}
          square={false}
          colors={["#FFAD08", "#EDD75A", "#73B06F", "#0C8F8F", "#405059"]}
        />
      </TextCenter>
      <Spacer h={16} />
    </CardBody>
  );
}

const CardBody = styled.div`
  background: var(--white);
  color: var(--primary-dark);
  border-radius: 0 0 12px 12px;
`;
