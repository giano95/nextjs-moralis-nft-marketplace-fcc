async function deleteIfAlreadyExists(ActiveItem, request, logger) {
    // Query the 'ActiveItem' table in order to find if an obj already exists
    const query = new Moralis.Query(ActiveItem)
    query.equalTo("nftAddress", request.object.get("nftAddress"))
    query.equalTo("tokenId", request.object.get("tokenId"))
    query.equalTo("marketplaceAddress", request.object.get("address"))
    query.equalTo("seller", request.object.get("seller"))
    logger.info(`Marketplace | Query: ${query}`)

    // Take the first obj of the query
    const alreadyListedItem = await query.first()
    console.log(`alreadyListedItem ${JSON.stringify(alreadyListedItem)}`)

    // If it exists delete it since we are gonna create it a new one
    if (alreadyListedItem) {
        logger.info(`Deleting ${alreadyListedItem.id}`)
        await alreadyListedItem.destroy()
        logger.info(
            `Deleted item with tokenId ${request.object.get(
                "tokenId"
            )} at address ${request.object.get("address")} since the listing is being updated. `
        )
    }
}

// Anytime a 'ItemListed' obj is created we call this function
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    if (confirmed) {
        logger.info("ItemListed row created")
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // Since in NftMarketplace contract we have a updateListing function that
        // call itemListing we check if the item already exists (aka the function generating
        // this event was updateListing) and if so we delete it
        await deleteIfAlreadyExists(ActiveItem, request, logger)

        // Add new ActiveItem by taking the ListItems values and setting there
        // on the new ActiveItem obj
        const activeItem = new ActiveItem()
        activeItem.set("marketplaceAddress", request.object.get("address"))
        activeItem.set("nftAddress", request.object.get("nftAddress"))
        activeItem.set("price", request.object.get("price"))
        activeItem.set("tokenId", request.object.get("tokenId"))
        activeItem.set("seller", request.object.get("seller"))
        logger.info(
            `Adding Address: ${request.object.get("address")} TokenId: ${request.object.get(
                "tokenId"
            )}`
        )
        logger.info("Saving...")
        await activeItem.save()
    }
})

// Anytime a 'ItemCanceled' obj is created we call this function
Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed")
    logger.info(`Marketplace | Object: ${request.object}`)
    if (confirmed) {
        const logger = Moralis.Cloud.getLogger()
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // Query the 'ActiveItem' table in order to find an obj that
        // match the Item we are canceling
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`Marketplace | Query: ${query}`)

        // Take the first obj of the query
        const canceledItem = await query.first()
        logger.info(`Marketplace | CanceledItem: ${JSON.stringify(canceledItem)}`)

        // If it exists delete it
        if (canceledItem) {
            logger.info(`Deleting ${canceledItem.id}`)
            await canceledItem.destroy()
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since it was canceled. `
            )
        } else {
            logger.info(
                `No item canceled with address: ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")} found.`
            )
        }
    }
})

// Anytime a 'ItemBought' obj is created we call this function
Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")
    logger.info(`Marketplace | Object: ${request.object}`)

    if (confirmed) {
        const logger = Moralis.Cloud.getLogger()
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // Query the 'ActiveItem' table in order to find an obj that
        // match the Item we are boughting
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`Marketplace | Query: ${query}`)

        // Take the first obj of the query
        const boughtItem = await query.first()
        logger.info(`Marketplace | boughtItem: ${JSON.stringify(boughtItem)}`)

        // If it exists delete it
        if (boughtItem) {
            logger.info(`Deleting boughtItem ${boughtItem.id}`)
            await boughtItem.destroy()
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get(
                    "address"
                )} from ActiveItem table since it was bought.`
            )
        } else {
            logger.info(
                `No item bought with address: ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")} found`
            )
        }
    }
})
