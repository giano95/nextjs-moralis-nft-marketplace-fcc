import Head from "next/head"
import { Form } from "web3uikit"
import styles from "../styles/Home.module.css"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"

const contractAbis = require("../constants/abisMapping.json")
const contractAddresses = require("../constants/addressesMapping.json")
const nftMarketplaceAbi = contractAbis["NftMarketplace"]
const nftAbi = contractAbis["FreakyEyes"]
const marketplaceAddress = contractAddresses[chainIdString].NftMarketplace

export default function Home() {
    const { chainId, account, isWeb3Enabled, Moralis } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : null
    //if (!chainIdString) throw new Error("Cannot read chainId from Moralis")
    const provider = Moralis.web3

    const approve = async ({ onError, onSuccess, params }) => {
        let tx
        try {
            const signer = provider.getSigner()
            const marketplaceContract = new ethers.Contract(
                params.contractAddress,
                params.abi,
                signer
            )
            tx = await marketplaceContract.approve(params.params)
        } catch (error) {
            if (onError) onError(error)
            return
        }
        if (onSuccess) onSuccess(tx)
        return tx
    }

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "tokenURI",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: (data) => console.log(data),
            onError: (error) => console.log(error),
        })
    }

    return (
        <div className={styles.container}>
            <h1>SellPage</h1>
            <Form
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        value: "",
                        key: "nftAddress",
                        inputWidth: "50%",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                        inputWidth: "50%",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                        inputWidth: "50%",
                    },
                ]}
                onSubmit={approveAndList}
            ></Form>
        </div>
    )
}
