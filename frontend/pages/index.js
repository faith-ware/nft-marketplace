import { ethers, utils } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Head from 'next/head';
import { useEffect, useRef, useState } from "react";
import { abi, MarketPlace_Contract_Address, userNftAbi } from "../constants";
export default function Home() {
    const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "434d293815cd474081e89aefc46a5371"
          }
        }
    };

    const [ connected, setConnected ] = useState(false);
    let [ signer, setSigner] = useState();

    const web3ModalRef = useRef();

    const connectWallet = async () => {
      try {
        const provider = await web3ModalRef.current.connect();
        const library = new ethers.providers.Web3Provider(provider);
        const { chainId } = await library.getNetwork();

        // if (chainId !== 4) {
        //   window.alert("Change the network to Rinkeby");
        //   throw new Error("Change network to Rinkeby");
        // }

        const accounts = await library.listAccounts();
        const network = await library.getNetwork().name
        const signer = library.getSigner();
        setSigner(signer);

      } catch (error) {
        console.error(error);
      }
    }

    const listItem = async ()=> {
      try {
        let marketPlaceContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        let userContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        // let approvalCheck = await userContract.getApproved(2);
        // console.log(approvalCheck);
        // let userApproval = await userContract.approve(MarketPlace_Contract_Address, 2);
        // // console.log(userContract.getOwnerOf(1));
        // await userApproval.wait();
        let transaction = await marketPlaceContract.listItem(MarketPlace_Contract_Address, 2, 310000000000000);
        await transaction.wait();
        // let nextTran = await marketPlaceContract.sayHello("0xD9DCdbe22892447aFA7d67275DC72d19b3420589", 2);
        // console.log(nextTran);
      } catch (err) {
        alert("Unable to list item");
        console.log(err)
      }
    }

    const buyItem = async () => {
      try {
        let nftContractAddress = MarketPlace_Contract_Address;
        let marketPlaceContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        let wei = ethers.BigNumber.from(310000000000000)
        let buyItem = await marketPlaceContract.buyItem(nftContractAddress, 2, {
          value : utils.parseEther("0.00031")
        })

        await buyItem.wait();
      } catch (err) {
        alert("Unable to buy item");
        console.log(err);
      }
    }

    const checkListedItem = async () => {
      try {
        let marketPlaceContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        let checkListing = await marketPlaceContract.getListedItem("0xD9DCdbe22892447aFA7d67275DC72d19b3420589", 2);
        console.log(checkListing);
      } catch (err) {
        alert("Unable to check item");
        console.log(err);
      }
    }

    const withdrawBalance = async () => {
      try {
        let marketPlaceContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        let withdrawal = await marketPlaceContract.withdrawBalance();
        await withdrawal.wait();
      } catch (err) {
        alert("Unable to withdraw balance");
        console.log(err);
      }
    }

    const mint= async () => {
      try {
        let marketPlaceContract = new ethers.Contract(MarketPlace_Contract_Address, abi, signer);
        let mintAct = await marketPlaceContract.mint({
          value: utils.parseEther("0.00001"),
        });
        await mintAct.wait();
      } catch (err) {
        alert("Unable to mint nft");
        console.log(err);
      }
    }


    useEffect(() => {
      if (connected == false) {
        console.log("Yo")
        web3ModalRef.current =  new Web3Modal({
        network: 'rinkeby',
        cacheProvider: true,
        // disableInjectedProvider: true,
        providerOptions
      });
      }
    }, [])

    // useEffect(() => {
    //   if (web3ModalRef.current.cachedProvider) {
    //     connectWallet();
    //   }
    // }, []);

    return (
        <div>
            <Head>
                <title>Nft Marketplace</title>
                <meta name="description" content="Whitelist-Dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div>
              <button onClick={connectWallet}>Connect</button>
              <button onClick={listItem}>List Item</button>
              <button onClick={buyItem}>Buy Item</button>
              <button onClick={checkListedItem}>Check Item</button>
              <button onClick={withdrawBalance}>Withdraw Balance</button>
              <button onClick={mint}>Mint</button>
            </div>
        </div>
    )
}