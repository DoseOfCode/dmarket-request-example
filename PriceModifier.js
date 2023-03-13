/* 
    
    Logs total cash amount of RUST listings and modifies all RUST listings by price by -2%

* */

const DMarket = require('./DMarket');

DMarket.get("/marketplace-api/v1/user-offers?GameID=rust&Status=OfferStatusActive&Limit=1000")
    .then(async (res) =>
    {
        console.log((res.data.Items ?? []).map((x) => x?.Offer?.Price?.Amount ?? 0).reduce((a, b) => a + b, 0));

        for (let i = 0; i < res.data?.Items?.length ?? 0; i++)
        {
            const item = res.data.Items[i];

            DMarket.post(
                "/marketplace-api/v1/user-offers/edit",
                {
                    Offers: [{
                        "AssetID": item["AssetID"],
                        "OfferID": item["Offer"]["OfferID"],
                        "Price": {
                            "Amount": +(item["Offer"]["Price"]["Amount"] * 0.98).toFixed(2),
                            "Currency": "USD"
                        }
                    }]
                }
            )
            .catch(console.log)
            .then((res) => console.log(res.data));

            if (i % 2)
            {
                await new Promise((resolve) => setTimeout(resolve, 300))
            }
        }

    })
    .catch(console.error);