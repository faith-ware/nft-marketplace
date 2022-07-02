const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    const metadataURL = "ipfs://Qmbygo38DWF1V8GttM1zy89KzyZTPU2FLUzQtiDvB7q6i5/";

    const nftMarketPlaceContract = await ethers.getContractFactory("NftMarkeplace");

    const deployedNftMarketPlaceContract = await nftMarketPlaceContract.deploy(metadataURL);
    console.log("Nft market place is", deployedNftMarketPlaceContract.address);

}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
})