import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis, useWeb3Contract } from "react-moralis"
import NFTBox from "../components/NFTBox"

const contractAbis = require("../constants/abisMapping.json")
const nftAbi = contractAbis["FreakyEyes"]

export default function Home() {
    const { isWeb3Enabled } = useMoralis()
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem", // TableName
        (query) => query.limit(10).descending("tokenId") // Query function
    )

    return (
        <div className="container mx-auto">
            <h1>Homepage</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            //console.log(nft.attributes)
                            const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                                nft.attributes

                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
