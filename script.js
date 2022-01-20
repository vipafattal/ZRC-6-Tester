var ContractAddress = "0x12e5c1d65055c09a127d8074c3f3a324569d7d05";
var ContractObject;
var ContractState;
var currentAccountAddress = "";

function onloadInit() {
	connectAppToWallet();
	console.clear();
}

async function connectAppToWallet() {
	let isWalletExist = window.zilPay;
	let isConnected = await window.zilPay.wallet.connect();
	if (isWalletExist && isConnected) loadWalletInfo();
	else alert("Something went wrong connecting wallet, try again later.");
}

async function loadContract(newContract) {
	restGallery();
	try {
		ContractAddress = newContract;
		ContractObject = window.zilPay.contracts.at(ContractAddress);
		ContractState = await ContractObject.getState();
		//alert("Contract State Loaded Successfully!")
		loadGalleryItems();
	} catch (err) {
		console.log(err.message);
		return false;
	}
}
function loadNewNFTContract() {
	ContractAddress = prompt("Please enter contract address", ContractAddress)
	loadContract(ContractAddress);
}

async function loadUserNFT() {
	var newAccountAddress = currentAccountAddress;
	if (currentAccountAddress == "")
		newAccountAddress = prompt("Enter bech32 address:", window.zilPay.wallet.defaultAccount.base16);

	if (newAccountAddress !== currentAccountAddress) {
		console.log("loading contract with new address")
		loadContract(ContractAddress);
	}
}

function loadWalletInfo() {
	//if successful hide button and show net and address
	document.querySelector("#wallet-address-container").style.display = "inline-block";
	document.querySelector("#connect-button-container").style.display = "none";

	//get and set network and address
	let walletNetworkType = window.zilPay.wallet.net;
	let currentUserAddress = window.zilPay.wallet.defaultAccount.base16;
	document.querySelector("#wallet-network-span").innerHTML = walletNetworkType;
	document.querySelector("#wallet-address-span").innerHTML = currentUserAddress;
}


async function restGallery() {
	document.querySelector("#gallery-container").innerHTML = "";
}

async function loadGalleryItems() {

	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "";

	let tokenOwners = ContractState.token_owners;
	let tokenUris = ContractState.token_uris;
	let baseURI = ContractState.base_uri;

	var galleryHTMLCode = "";
	var currentWalletAccountAddress = window.zilPay.wallet.defaultAccount.base16;

	for (i in tokenOwners) {
		let tokenId = tokenUris[i];
		if (currentAccountAddress != "")
			if (tokenOwners[i].toUpperCase() != currentAccountAddress.toUpperCase()) continue

		var transferBtn = "";

		if (tokenOwners[i].toUpperCase() == currentWalletAccountAddress.toUpperCase()){
			transferBtn = "<button onclick='transferNFT(`" + tokenId + "`)'>Transfer</button>"
		}
		galleryHTMLCode += `
		<div id="nft-${i}" class="nft-card">
			<div class="nft-card-id HVCenter">NFT ID: ${i}&nbsp;${transferBtn}</div>
			<div class="nft-card-token">Token: ${tokenUris[i]}</div>
			<div class="nft-card-owner">${tokenOwners[i]}</div>
		</div>
		`;
	}

	gallery.innerHTML = galleryHTMLCode;
}


function mintNFT() {
	if (!ContractState) {
		alert("Please load contract first");
		return;
	}
	/*check if the user is a minter*/
	flag = false;
	var accountAddress = window.zilPay.wallet.defaultAccount.base16;
	for (i in ContractState.minters) {
		if (i.toUpperCase() == accountAddress.toUpperCase()) {
			flag = true;
			break;
		}
	}
	if (!flag) {
		alert("You don't have a mint access");
		return;
	}
	/*check if the user is a minter*/
	//geting inputs
	var NftTo = document.querySelector("#mintnft_to").value;
	var NftUri = document.querySelector("#mintnft_uri").value;
	if (NftTo !== "" && NftUri !== "") {
		/* Code for transaction call */
		const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);
		var tx = ContractObject.call('Mint', [{
			vname: "to",
			type: "ByStr20",
			value: NftTo
		}, {
			vname: "token_uri",
			type: "String",
			value: NftUri
		}],
			{
				gasPrice: gasPrice,
				gasLimit: window.zilPay.utils.Long.fromNumber(10000)
			});
		/* Code for transaction call */
		//handle the promise accordingly
		tx.then(function (a) {
			console.log(a);
		}).catch(function (error) {
			console.log(error);
		});
	}
}

function transferNFT(tokenId) {
	var receiverAddress = prompt("Please enter the address you want to send NFT ID:" + tokenId + " to");
	if (receiverAddress != "") {
		/* Code for transaction call */
		const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);
		var tx = ContractObject.call('TransferFrom', [{
			vname: "to",
			type: "ByStr20",
			value: receiverAddress
		}, {
			vname: "token_id",
			type: "Uint256",
			value: tokenId
		}],
			{
				gasPrice: gasPrice,
				gasLimit: window.zilPay.utils.Long.fromNumber(10000)
			});
		/* Code for transaction call */
		//handle the promise accordingly
		tx.then(function (a) {
			console.log(a);
		}).catch(function (error) {
			console.log(error);
		});
	}
}

function showMintbox() {
	document.querySelector("#mintbox-container").style.display = "flex";
}

function hideMintbox() {
	document.querySelector("#mintbox-container").style.display = "none";
}

async function loadJsonData(url) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			"Access-Control-Allow-Origin": "recipesapi.herokuapp.com"
		}
	});
	return data = await response.json();
}














