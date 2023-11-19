import { FrogCryptoFolderName } from "@pcd/passport-interface";
import {
  getNameFromPath,
  getParentFolder,
  isRootFolder
} from "@pcd/pcd-collection";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  useFolders,
  usePCDCollection,
  usePCDsInFolder,
  useSelf
} from "../../src/appHooks";
import { useSyncE2EEStorage } from "../../src/useSyncE2EEStorage";
import { isFrogCryptoFolder } from "../../src/util";
import { Placeholder, Spacer } from "../core";
import { icons } from "../icons";
import { MaybeModal } from "../modals/Modal";
import { AppContainer } from "../shared/AppContainer";
import { AppHeader } from "../shared/AppHeader";
import { LoadingIssuedPCDs } from "../shared/LoadingIssuedPCDs";
import { PCDCardList } from "../shared/PCDCardList";
import { FrogFolder } from "./FrogScreens/FrogFolder";
import { FrogHomeSection } from "./FrogScreens/FrogHomeSection";
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'
import { LensConfig, production } from '@lens-protocol/react-web'
import { bindings as wagmiBindings } from '@lens-protocol/wagmi'
import { LensProvider as Provider } from '@lens-protocol/react-web'
import {
  useProfile, usePublications, Profile, LimitType, PublicationType
} from '@lens-protocol/react-web'

const lensConfig: LensConfig = {
  bindings: wagmiBindings(),
  environment: production,
}
export const HomeScreen = React.memo(HomeScreenImpl);

const FOLDER_QUERY_PARAM = "folder";

// apiFunctions.js
import axios from 'axios';

export const fetchUniversalProfile = async (identity) => {
  try {
    const response = await axios.get(`https://api.web3.bio/profile/${identity}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching universal profile:', error);
    return null;
  }
};

export const fetchENSProfile = async (identity) => {
  try {
    const response = await axios.get(`https://api.web3.bio/profile/ens/${identity}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ENS profile:', error);
    return null;
  }
};

export const fetchLensProfile = async (identity) => {
    try {
      const response = await axios.get(`https://api.web3.bio/profile/lens/${identity}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ENS profile:', error);
      return null;
    }
};

export const fetchFarcasterProfile = async (identity) => {
    try {
        const response = await axios.get(`https://api.web3.bio/profile/farcaster/${identity}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ENS profile:', error);
        return null;
    }
};

export const fetchDotBitProfile = async (identity) => {
    try {
        const response = await axios.get(`https://api.web3.bio/profile/dotbit/${identity}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ENS profile:', error);
        return null;
    }
};

import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet } from 'viem/chains'

// 1. Get projectId
const projectId = '48c9cd8b7bc6a96a823061743a2def6b'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Connection',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}
const chains = [mainnet, arbitrum]


const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

/**
 * Show the user their Zupass, an overview of cards / PCDs.
 */
export function HomeScreenImpl() {
  useSyncE2EEStorage();
  const self = useSelf();
  const navigate = useNavigate();

  const pcdCollection = usePCDCollection();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultBrowsingFolder = useMemo(() => {
    const folderPathFromQuery = decodeURIComponent(
      searchParams.get(FOLDER_QUERY_PARAM)
    );
    if (!folderPathFromQuery) {
      return "";
    }
    // FrogCrypto is always valid even if user doesn't have any FrogPCD
    if (folderPathFromQuery === FrogCryptoFolderName) {
      return folderPathFromQuery;
    }

    return pcdCollection.isValidFolder(folderPathFromQuery)
      ? folderPathFromQuery
      : "";
  }, [pcdCollection, searchParams]);

  const [browsingFolder, setBrowsingFolder] = useState(defaultBrowsingFolder);
  const pcdsInFolder = usePCDsInFolder(browsingFolder);
  const foldersInFolder = useFolders(browsingFolder);

  useEffect(() => {
    if (self == null) {
      console.log("Redirecting to login screen");
      navigate("/login", { replace: true });
    }
  });

  useEffect(() => {
    if (sessionStorage.newAddedPCDID != null) {
      // scroll to element with id of newAddedPCDID
      const el = document.getElementById(sessionStorage.newAddedPCDID);
      if (el) {
        el.scrollIntoView();
      }
      delete sessionStorage.newAddedPCDID;
    }
  });

  useEffect(() => {
    if (!browsingFolder) {
      setSearchParams(undefined);
    } else {
      setSearchParams({
        [FOLDER_QUERY_PARAM]: encodeURIComponent(browsingFolder)
      });
    }
  }, [browsingFolder, setSearchParams]);

  const onFolderClick = useCallback((folder: string) => {
    setBrowsingFolder(folder);
  }, []);

  const isRoot = isRootFolder(browsingFolder);
  const isFrogCrypto = isFrogCryptoFolder(browsingFolder);

  // scroll to top when we navigate to this page
  useLayoutEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, []);
  const { open } = useWeb3Modal()
  const [showLensProfile, setShowLensProfile] = useState(false);
  const toggleLensProfile = useCallback(() => {
    setShowLensProfile(prev => !prev);
  }, []);

  if (self == null) return null;
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const lensAddress = JSON.parse(localStorage.getItem('lens.production.wallets'))?.data?.[0]?.address;
    if (lensAddress) {
      fetchLensProfile(lensAddress)
        .then(profileData => setProfile(profileData))
        .catch(error => {
          console.error('Error fetching Lens profile:', error);
        });
    }
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <Provider config={lensConfig}>
      <MaybeModal />
      <AppContainer bg="gray">
        <Spacer h={24} />
        <AppHeader />
        <Spacer h={24} />
        <Placeholder minH={50}>
          <FolderExplorerContainer>
            {(isRoot && false &&
              <>
                <button onClick={() => open()}>Open Connect Modal</button>
                <button onClick={() => open({ view: 'Networks' })}>Open Network Modal</button>
              </>
            )}
          </FolderExplorerContainer>
        </Placeholder>
        <Placeholder minH={540}>
          <LoadingIssuedPCDs />
          {isRoot && localStorage.getItem('lens.production.wallets') && (
            <FolderExplorerContainer>
              <FolderCard
                key={"LensProfile"}
                onFolderClick={() => setShowLensProfile(prev => !prev)}
                folder={`Lens Pass`}
              />
              {showLensProfile && (
                <div style={{ height: '450px', paddingTop: '15px' }}>
                  {(() => {
                    console.log("profile:", profile)
                    return profile ? (
                      <div style={{ textAlign: 'center' }}>
                        <img src={profile.avatar} alt={profile.displayName} style={{ width: '200px', height: '200px', borderRadius: '50%' }} />
                        <h2>{profile.displayName}</h2>
                        <p>{profile.description}</p>
                        <p>{profile.location}</p>
                        {profile.links?.hey && (
                          <div>
                            <a href={profile.links.hey} target="_blank" rel="noopener noreferrer">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profile.links.hey.link)}`} alt={`QR code for ${profile.links.handle}`} />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : <div>Loading...</div>;
                  })()}
                </div>
              )}
            </FolderExplorerContainer>
          )}
          {!(foldersInFolder.length === 0 && isRoot) && (
            <FolderExplorerContainer>
              {false && (
                <>
                <FolderCard
                  key={"LineaTicket"}
                  onFolderClick={() => open()}
                  folder={"Linea Ticket"}
                />
                <FolderCard
                  key={"zkSyncTicket"}
                  onFolderClick={() => open()}
                  folder={"zkSync Ticket"}
                />
                <FolderCard
                  key={"MantleTicket"}
                  onFolderClick={() => open()}
                  folder={"Mantle Ticket"}
                /></>)}
              {!isRoot && (
                <FolderDetails
                  noChildFolders={foldersInFolder.length === 0}
                  folder={browsingFolder}
                  onFolderClick={onFolderClick}
                />
              )}
              {foldersInFolder
                .filter(
                  (folder) => folder !== FrogCryptoFolderName
                )
                .sort((a, b) => a.localeCompare(b))
                .map((folder) => {
                  return (
                    <FolderCard
                      key={folder}
                      onFolderClick={onFolderClick}
                      folder={folder}
                    />
                  );
                })}
              {isRoot && (
                <FrogFolder
                  Container={FolderEntryContainer}
                  onFolderClick={onFolderClick}
                />
              )}
            </FolderExplorerContainer>
          )}

          {isFrogCrypto ? (
            <FrogHomeSection />
          ) : (
            <>
              {!(foldersInFolder.length === 0 && isRoot) && <Separator />}
              {pcdsInFolder.length > 0 ? (
                <PCDCardList pcds={pcdsInFolder} />
              ) : (
                <NoPcdsContainer>This folder has no PCDs</NoPcdsContainer>
              )}
            </>
          )}
        </Placeholder>
        <Spacer h={24} />
      </AppContainer>
      </Provider>
    </WagmiConfig>
  );
}

const NoPcdsContainer = styled.div`
  padding: 32;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  color: rgba(255, 255, 255, 0.7);
`;

function FolderDetails({
  folder,
  onFolderClick,
  noChildFolders
}: {
  folder: string;
  onFolderClick: (folder: string) => void;
  noChildFolders: boolean;
}) {
  const onUpOneClick = useCallback(() => {
    onFolderClick(getParentFolder(folder));
  }, [folder, onFolderClick]);

  return (
    <FolderHeader
      onClick={onUpOneClick}
      style={noChildFolders ? { borderBottom: "none" } : undefined}
    >
      <span className="btn">
        <img draggable="false" src={icons.upArrow} width={18} height={18} />
      </span>
      <span className="name">{folder}</span>
    </FolderHeader>
  );
}

function FolderCard({
  folder,
  onFolderClick
}: {
  folder: string;
  onFolderClick: (folder: string) => void;
}) {
  const onClick = useCallback(() => {
    onFolderClick(folder);
  }, [folder, onFolderClick]);

  return (
    <FolderEntryContainer onClick={onClick}>
      <img draggable="false" src={icons.folder} width={18} height={18} />
      {getNameFromPath(folder)}
    </FolderEntryContainer>
  );
}

const FolderExplorerContainer = styled.div`
  border-radius: 12px;
  border: 1px solid grey;
  background: var(--primary-dark);
  overflow: hidden;
  margin: 12px 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-direction: column;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  margin-top: 32px;
  margin-bottom: 32px;
  background-color: grey;
  user-select: none;
`;

const FolderHeader = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
  border-bottom: 1px solid grey;
  background: var(--bg-dark-gray);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--bg-lite-gray);
  }

  .name {
    flex-grow: 1;
    padding: 12px 16px;
    border-left: none;
    box-sizing: border-box;
  }

  .btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    display: inline-block;
    padding-top: 16px;
    padding-left: 12px;
  }
`;

const FolderEntryContainer = styled.div`
  user-select: none;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 12px;
  border-bottom: 1px solid grey;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--primary-lite);
  }
`;
