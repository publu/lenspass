import styled from "styled-components";
import { icons } from "../icons";

export function Spinner({ text, show }: { text: string; show: boolean }) {
  return (
    <SpinnerWithText>
      <SpinnerContainer>
        {show && <SpinnerImage src={icons.spinner} />}
      </SpinnerContainer>
      <SpinnerText>{text}</SpinnerText>
    </SpinnerWithText>
  );
}

const SpinnerContainer = styled.div`
  width: 16px;
`;

const SpinnerText = styled.div`
  flex-grow: 1;
  margin-right: 16px;
`;

const SpinnerWithText = styled.div`
  display: flex;
  align-items: center;
  column-gap: 8px;
`;

const SpinnerImage = styled.img`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
