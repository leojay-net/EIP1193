import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

const WalletManagement = () => {
    const [isSupported, setIsSupported] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [chainId, setChainId] = useState("")
    const [chainName, setChainName] = useState("")

    const supportedChains = {
        '0x1': "Mainnet",

        '0xaa36a7': "Sepolia",
        '0x38': "Binance Smart Chain",
        '0x61': "Binance Smart Chain Testnet",
        '0x89': "Matic Mainnet",
        '0x45a': "Core Blockchain Testnet2"
    };

    const chainsToAdd = {
        '0x1': {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://etherscan.io']
        },
        '0xaa36a7': {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            rpcUrls: ['https://sepolia.drpc.org'],
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
        },
        '0x38': {
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            rpcUrls: ['https://bnb.rpc.subquery.network/public'],
            nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
            blockExplorerUrls: ['https://bscscan.com']
        },
        '0x61': {
            chainId: '0x61',
            chainName: 'Binance Smart Chain Testnet',
            rpcUrls: ['https://bsc-testnet.drpc.org'],
            nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
            blockExplorerUrls: ['https://testnet.bscscan.com']
        },
        '0x89': {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            rpcUrls: ['https://polygon-rpc.com'],
            nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
            blockExplorerUrls: ['https://polygonscan.com']
        },
        '0x45a': {
            chainId: '0x45a',
            chainName: 'Core Blockchain Testnet2',
            rpcUrls: ['https://rpc.test2.btcs.network'],
            nativeCurrency: { name: 'tCORE2', symbol: 'tCORE2', decimals: 18 }
            // blockExplorerUrls: ['https://explorer.test2.btcs.network']
        }
    }


    useEffect(() => {

        if (window.ethereum) {
            const ethereum = window.ethereum

            checkConnectionState()


            ethereum.on("chainChanged", (chain) => handleChainid())

            ethereum.on("accountsChanged", (accounts) => handleAccountsChanged(accounts))

            ethereum.on("disconnect", (error) => {
                alert(error)
                setIsConnected(false)
                setAccounts([])
                setChainId("")
                setChainName("")
            })

            return () => {
                window.ethereum.removeListener("chainChanged", handleChainid);
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("disconnect", handleDisconnect);
            };
        }


    }, [])

    const checkConnectionState = async () => {
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setAccounts(accounts);
                setIsConnected(true);
                handleChainid();
            }
        } catch (error) {
            console.error("Error checking connection state:", error);
        }
    };

    const handleChainid = async () => {
        const chainId = await window.ethereum.request({ method: "eth_chainId", params: [] })
        console.log(chainId)
        const _chainId = chainId.toString()
        console.log(_chainId)
        setChainId(_chainId)
        if (supportedChains[_chainId]) {
            setChainName(supportedChains[_chainId])
            setIsSupported(true)
        } else {
            setChainName("Unsupported Chain")
            setIsSupported(false)
        }
    }

    const handleAccountsChanged = (newAccounts) => {
        console.log("Accounts changed:", newAccounts);
        if (newAccounts.length === 0) {
            setIsConnected(false);
            setAccounts([]);
        } else {
            setAccounts(newAccounts);
            setIsConnected(true);
        }
    };

    const handleConnect = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts", params: [] })
            console.log(accounts)
            setIsConnected(true)
            setAccounts(accounts)
            handleChainid()
        }
    }

    const handleDisconnect = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] })
            console.log(accounts)
            setIsConnected(false)
            setAccounts([])
            setChainId("")
            setChainName("")
        }
    }

    const handleSwitchChain = async (chainId) => {
        if (window.ethereum) {
            console.log(chainId)
            try {
                const result = await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainId }] })
                console.log(result)
                handleChainid()
            }
            catch (error) {
                console.log(error)
                if (error.code === 4902) {
                    handleAddChain(chainId)
                }
            }
        }
    }

    const handleSendTransaction = async (e, to, value) => {
        if (window.ethereum) {
            e.preventDefault()
            console.log("sending transaction")
            const hexValue = "0x" + ethers.parseEther(value).toString(16)
            const result = await window.ethereum.request({
                method: "eth_sendTransaction", params: [
                    {
                        from: accounts[0],
                        to: to,
                        value: hexValue,
                    },
                ]
            })
            console.log(result)
        }
    }


    const handleAddChain = async (chainId) => {
        console.log(chainsToAdd[chainId], chainId)
        if (!chainsToAdd[chainId]) {
            console.log("Chain not supported")
            return
        }
        if (window.ethereum) {
            const result = await window.ethereum.request({ method: "wallet_addEthereumChain", params: [chainsToAdd[chainId]] })
            console.log(result)
        }
    }


    return (
        <>
            <h1>Wallet Management Mini-Dapp</h1>

            {isConnected ?
                <div>
                    <p>Accounts: {accounts[0]}</p>
                    <p>ChainId: {parseInt(chainId).toString()}</p>
                    <p>ChainName: {chainName}</p>
                    <p>Support: {isSupported ? "True" : "False"}</p>
                    <p>Connected</p>
                    <button onClick={handleDisconnect}>Disconnect</button>
                    <select value={chainId} onChange={(e) => handleSwitchChain(e.target.value)}>
                        {Object.keys(supportedChains).map((chainId) => <option key={chainId} value={chainId}>{supportedChains[chainId]}</option>)}
                    </select>

                    <form onSubmit={(e) => (handleSendTransaction(e, e.target[0].value, e.target[1].value))}>
                        <input type="text" placeholder="To" />
                        <input type="number" step="0.01" min="0" placeholder="Value" />
                        <button type="submit">Send Transaction</button>
                    </form>
                </div>

                : <button onClick={handleConnect}>Connect</button>}
        </>
    )
}

export default WalletManagement;
