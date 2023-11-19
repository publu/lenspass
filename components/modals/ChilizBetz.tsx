import { AppContainer } from "../shared/AppContainer";
import styled from 'styled-components';
import { useState } from 'react';
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { chiliz } from 'viem/chains'
import type { Address } from 'wagmi'
import { useContractRead } from 'wagmi'

// 1. Get projectId
const projectId = '48c9cd8b7bc6a96a823061743a2def6b'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Connection',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [chiliz]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })
const Section = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6; /* bg-gray-100 */
`;

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  max-width: 1280px;
  margin: auto;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;

  @media (min-width: 640px) {
    flex-direction: row;
    gap: 2rem;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: #ffffff; /* bg-white */
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  width: 100%;

  @media (min-width: 640px) {
    width: auto;
  }
`;

const Image = styled.img`
  aspect-ratio: 1 / 1;
  height: 140px;
  width: 140px;
  object-fit: contain;
  border-radius: 1rem;
`;

const Button = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 100%;
  background-color: #10b981; /* bg-green-500 */
  color: #ffffff;
  font-weight: bold;
  border-radius: 9999px;
  text-align: center;
  text-decoration: none;
  margin: 0.5rem 0;

  &:hover {
    background-color: #059669; /* hover:bg-green-600 */
  }
`;

const Tab = styled.button`
  padding: 1rem;
  border: none;
  background-color: transparent;
  font-weight: bold;
  color: #4b5563; /* text-gray-600 */
  border-bottom: 3px solid transparent;

  &:hover {
    color: #111827; /* text-gray-900 */
  }

  &.active {
    color: #111827; /* text-gray-900 */
    border-bottom: 3px solid #10b981; /* border-green-500 */
  }
`;

const List = styled.div`
  margin-top: 1rem;
  background-color: #ffffff; /* bg-white */
  padding: 1rem;
  border-radius: 0.5rem;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #000000; /* text-black */
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb; /* divide-gray-200 */
  color: #000000; /* text-black */
`;

const BoldText = styled.span`
  font-weight: bold;
  color: #000000; /* text-black */
`;

export default function ChilizBetz() {
  const [activeTab, setActiveTab] = useState('PSG');
  const { open } = useWeb3Modal()
  const contractAddress = '0xDCA6d7C06A3e989aA7266d8f51Eea2fC45A6d167';
  const abi = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "betId",
          "type": "uint256"
        }
      ],
      "name": "certifyOutcome",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_endTime",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_gameInfoIPFS",
          "type": "string"
        }
      ],
      "name": "createBet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "depositStake",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "betId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "placeBet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "betId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "chosenWinnerToken",
          "type": "address"
        }
      ],
      "name": "voteOutcome",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "betId",
          "type": "uint256"
        }
      ],
      "name": "withdrawWinnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "bets",
      "outputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "gameInfoIPFS",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "settled",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "winnerToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "voteEndTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_BET",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextBetId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "STAKE_AMOUNT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "stakers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "stakeAmount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isVerified",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VOTING_PERIOD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  return (
    <WagmiConfig config={wagmiConfig}>

    <AppContainer bg="gray">
      <Section>
        <Container>
            <button onClick={() => window.location.href = '/#/'}>Return</button>
            <button onClick={() => open()}>Connect</button>
          <FlexRow>
            {/* Timer Section */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>00:00:00</div>
              <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Time Remaining</p>
              <div>
                <Tab onClick={() => setActiveTab('PSG')} className={activeTab === 'PSG' ? 'active' : ''}>PSG</Tab>
                <Tab onClick={() => setActiveTab('Manchester City')} className={activeTab === 'Manchester City' ? 'active' : ''}>Manchester City</Tab>
              </div>
              {activeTab === 'PSG' && (
                <Card>
                  <Image
                    alt="PSG Logo"
                    src="https://www.fanmarketcap.com/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Ffmc-27374.appspot.com%2Fo%2Ftokens%252Fzl0QDwRAe6A9j9Bo1ouoNtyZFodkT7vWVLgr0cka.png%3Falt%3Dmedia&w=128&q=75"
                  />
                  <Button href="#">Deposit for PSG</Button>
                  {/* Deposits List */}
                  <List>
                    <Title>Deposits:</Title>
                    <ul>
                      <ListItem>
                        <BoldText>{shortenAddress("0xf8c906F7076Ec3Aab56b3Dc19DA313c4Ff9cE2eA")}:</BoldText>
                        20 CITY
                      </ListItem>
                    </ul>
                  </List>
                </Card>
              )}
              {activeTab === 'Manchester City' && (
                <Card>
                  <Image
                    alt="Manchester City"
                    src="https://www.fanmarketcap.com/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Ffmc-27374.appspot.com%2Fo%2Ftokens%252FmJgwTHzCVVCJlqo1tF0NWP57igOYSXr5k1Vqvomd.png%3Falt%3Dmedia&w=128&q=75"
                  />
                  <Button href="#" style={{ backgroundColor: '#3b82f6' }}>Deposit for Manchester City</Button>
                  {/* Deposits List */}
                  <List>
                    <Title>Deposits:</Title>
                    <ul>
                      <ListItem>
                        <BoldText>{shortenAddress("0xf8c906F7076Ec3Aab56b3Dc19DA313c4Ff9cE2eA")}:</BoldText>
                        20 $PSG
                      </ListItem>
                    </ul>
                  </List>
                </Card>
              )}
            </div>
          </FlexRow>
          {/* Actions Section */}
          <FlexRow>
            <Button>Withdraw Winnings</Button>
            <Button>Stake</Button>
            <Button>Unstake</Button>
          </FlexRow>
          {/* Stakers List */}
          <List>
            <Title>Stakers:</Title>
            <ul>
              <ListItem>
                <BoldText>{shortenAddress("0xf8c906F7076Ec3Aab56b3Dc19DA313c4Ff9cE2eA")}</BoldText>
                1 CHZ
              </ListItem>
            </ul>
          </List>
        </Container>
      </Section>
    </AppContainer>
    </WagmiConfig>

  )
}
