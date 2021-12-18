import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import petPortal from './utils/PetPortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allPets, setAllPets] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x459de8d20C452C053Aa28aFE2Fe7dd1aADF8E6eB";

  const getAllPets = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const petPortalContract = new ethers.Contract(contractAddress, petPortal.abi, signer);

        const pets = await petPortalContract.getAllPets();

        let petsCleaned = [];
        pets.forEach(pet => {
          petsCleaned.push({
            address: pet.petOwner,
            timestamp: new Date(pet.timestamp * 1000),
            message: pet.message
          });
        });

        setAllPets(petsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

   const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  function changeHandler(event){
    setMessage(event.target.value)
    console.log("Message entered: ", event.target.value)
  }

  const pet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const petPortalContract = new ethers.Contract(contractAddress, petPortal.abi, signer);

        let count = await petPortalContract.getTotalImages();
        console.log("Total file count: ", count.toNumber());

        const petTxn = await petPortalContract.pet();
        console.log("In the process of mining ", petTxn.hash);

        await petTxn.wait();
        console.log("successfully mined ", petTxn.hash);

        count = await petPortalContract.getTotalImages();
        console.log("Total file count: ", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Welcome to the Pet Portal! 🐶
          </div>

        <div className="bio">
          Connect your Ethereum wallet and send me a photo of your pet (as a URL) for a chance to win ETH!
          </div>
        
        <textarea rows="3" cols="50" value={message} className="message" onChange={changeHandler} placeholder="Input URL here">  </textarea>

        <button className="petButton" onClick={pet}>
          Submit
          </button>

        {!currentAccount && (
          <button className="petButton" onClick={connectWallet}>
            Connect Wallet
            </button>
        )}

        {allPets.map((pet, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {pet.address}</div>
              <div>Time: {pet.timestamp.toString()}</div>
              <div>Message: {pet.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
export default App


