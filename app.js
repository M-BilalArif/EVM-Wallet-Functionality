let web3;
let account;
let currentChain = {};
let explorer = '';

const erc20Abi = [ /* same as before - unchanged */ 
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
    { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
    { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" }
];

// Chain Configurations
const chains = {
    "eth-mainnet": {
        name: "Ethereum Mainnet",
        rpc: "https://ethereum-rpc.publicnode.com",
        chainId: 1,
        native: "ETH",
        explorer: "https://etherscan.io/tx/",
        usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48"
    },
    "holesky": {
        name: "Holesky Testnet",
        rpc: "wss://ethereum-holesky-rpc.publicnode.com",
        chainId: 17000,
        native: "ETH",
        explorer: "https://holesky.etherscan.io/tx/",
        usdt: "0x66904de8a0D036CF32049A291721bF7dAbdD60d7",
        usdc: "0xe67c9211Bf5e22c8dE973A22e5d8cDC9F48e7A94"
    },
    "sepolia": {
        name: "Sepolia Testnet",
        rpc: "https://ethereum-sepolia-rpc.publicnode.com",
        chainId: 11155111,
        native: "ETH",
        explorer: "https://sepolia.etherscan.io/tx/",
        usdt: "0x63c650eb5416cD2ff2d24322F3593b1562D4B787",
        usdc: "0x2748e7153e450438591382D5daa2E5E497eC645F"
    },
    "bnb": {
        name: "BNB Smart Chain",
        rpc: "https://bsc.publicnode.com",
        chainId: 56,
        native: "BNB",
        explorer: "https://bscscan.com/tx/",
        usdt: "0x55d398326f99059fF775485246999027B3197955",
        usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
    },
    "bnb-testnet": {
        name: "BNB Smart Chain Testnet",
        rpc: "https://bsc-testnet.publicnode.com",
        chainId: 97,
        native: "tBNB",
        explorer: "https://testnet.bscscan.com/tx/",
        usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        usdc: "0x64544969ed7EBf5f083679233325356EbE738930"
    },
    "polygon": {
        name: "Polygon",
        rpc: "https://polygon-rpc.com",
        chainId: 137,
        native: "MATIC",
        explorer: "https://polygonscan.com/tx/",
        usdt: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
        usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
    },
    "amoy": {
        name: "Polygon Amoy Testnet",
        rpc: "https://rpc-amoy.polygon.technology",
        chainId: 80002,
        native: "MATIC",
        explorer: "https://amoy.polygonscan.com/tx/",
        usdt: "0x1616d425Cd540B256475cBfb604586C8598eC0FB",
        usdc: "0xc091020dD0e357989f303FC99ac5899fa343fF6D"
    },
    "avalanche": {
        name: "Avalanche C-Chain",
        rpc: "https://api.avax.network/ext/bc/C/rpc",
        chainId: 43114,
        native: "AVAX",
        explorer: "https://snowtrace.io/tx/",
        usdt: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        usdc: "0xB97EF9Ef8734c71904D8002F8b6Bc66Dd9c48a6E"
    },
    "fuji": {
        name: "Avalanche Fuji Testnet",
        rpc: "https://api.avax-test.network/ext/bc/C/rpc",
        chainId: 43113,
        native: "AVAX",
        explorer: "https://testnet.snowtrace.io/tx/",
        usdt: "0x5425890298aed601595a70AB815c96711a31Bc65",
        usdc: "0x5425890298aed601595a70AB815c96711a31Bc65"
    }
};

function initializeWeb3() {
    const selected = document.getElementById('network').value;
    currentChain = chains[selected];

    if (!currentChain) {
        alert("Invalid network selected");
        return;
    }

    // Update UI
    document.getElementById('currentNetwork').textContent = currentChain.name;
    document.getElementById('nativeToken').textContent = currentChain.native;
    document.getElementById('chainId').textContent = currentChain.chainId;
    explorer = currentChain.explorer;

    // Initialize Web3
    web3 = new Web3(currentChain.rpc);

    // Reconnect account if private key exists
    if (account && account.privateKey) {
        try {
            account = web3.eth.accounts.privateKeyToAccount(account.privateKey);
            document.getElementById('wallet').innerHTML = `
                <p>Address: ${account.address}</p>
                <p>Private Key: ${account.privateKey}</p>
            `;
            updateDataUI();
        } catch (e) {
            console.error("Invalid private key for this chain");
        }
    }
}

// Call on page load
window.onload = () => {
    initializeWeb3();
};

function createWallet() {
    initializeWeb3();
    account = web3.eth.accounts.create();
    displayWallet();
    updateDataUI();
}

function importWallet() {
    initializeWeb3();
    const privateKey = document.getElementById('privateKey').value.trim();
    if (!privateKey.startsWith('0x')) {
        alert("Private key must start with 0x");
        return;
    }
    try {
        account = web3.eth.accounts.privateKeyToAccount(privateKey);
        displayWallet();
        updateDataUI();
    } catch (e) {
        alert("Invalid private key");
    }
}

function displayWallet() {
    document.getElementById('wallet').innerHTML = `
        <p><strong>Address:</strong> ${account.address}</p>
        <p><strong>Private Key:</strong> ${account.privateKey}</p>
    `;
    document.getElementById('walletdiv').innerHTML = '';
    document.getElementById('downloadWalletdiv').innerHTML = `
        <button onclick="downloadWalletInfo()">Download Wallet Info</button>
    `;
}

async function checkBalance() {
    if (!account) return alert("No wallet loaded");
    initializeWeb3();

    try {
        const ethBalance = await web3.eth.getBalance(account.address);
        const nativeBalance = web3.utils.fromWei(ethBalance, 'ether');

        let usdtBalance = "N/A", usdcBalance = "N/A";

        if (currentChain.usdt) {
            const usdtContract = new web3.eth.Contract(erc20Abi, currentChain.usdt);
            const usdtBal = await usdtContract.methods.balanceOf(account.address).call();
            usdtBalance = Number(web3.utils.fromWei(usdtBal, 'mwei')).toFixed(6);
        }
        if (currentChain.usdc) {
            const usdcContract = new web3.eth.Contract(erc20Abi, currentChain.usdc);
            const usdcBal = await usdcContract.methods.balanceOf(account.address).call();
            usdcBalance = Number(web3.utils.fromWei(usdcBal, 'mwei')).toFixed(6);
        }

        document.getElementById('balance').innerHTML = `
            <p><strong>${currentChain.native} Balance:</strong> ${nativeBalance} ${currentChain.native}</p>
            <p><strong>USDT Balance:</strong> ${usdtBalance} USDT</p>
            <p><strong>USDC Balance:</strong> ${usdcBalance} USDC</p>
        `;
    } catch (error) {
        console.error(error);
        alert("Error fetching balance: " + error.message);
    }
}

async function SendToken() {
    if (!account) return alert("Create or import a wallet first");

    const toAddress = document.getElementById('toAddress').value.trim();
    const amount = document.getElementById('amount').value;
    const token = document.getElementById('token').value;

    if (!web3.utils.isAddress(toAddress)) return alert("Invalid recipient address");
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    if (confirm(`Send ${amount} ${token.toUpperCase()} to ${toAddress} on ${currentChain.name}?`)) {
        document.getElementById('Transaction_status').innerHTML = "<p>Transaction status: Processing...</p>";

        if (token === 'eth' || token === currentChain.native.toLowerCase().replace('tbnB', 'bnb')) {
            await sendNative(toAddress, amount);
        } else {
            const contractAddr = token === 'usdt' ? currentChain.usdt : currentChain.usdc;
            if (!contractAddr) return alert(`${token.toUpperCase()} not available on ${currentChain.name}`);
            await sendERC20(toAddress, amount, contractAddr, token.toUpperCase());
        }
    }
}

async function sendNative(to, amount) {
    const tx = {
        from: account.address,
        to: to,
        value: web3.utils.toWei(amount, 'ether'),
        gas: 21000
    };
    await signAndSend(tx, currentChain.native);
}

async function sendERC20(to, amount, contractAddr, tokenName) {
    const contract = new web3.eth.Contract(erc20Abi, contractAddr);
    const amountWei = web3.utils.toWei(amount, 'mwei');
    const data = contract.methods.transfer(to, amountWei).encodeABI();

    const gas = await contract.methods.transfer(to, amountWei).estimateGas({ from: account.address });

    const tx = {
        from: account.address,
        to: contractAddr,
        data: data,
        gas: gas + 20000,
        value: '0'
    };
    await signAndSend(tx, tokenName);
}

async function signAndSend(tx, tokenName) {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        tx.gasPrice = gasPrice;

        const signed = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

        document.getElementById('transaction').innerHTML = `
            <p>Success! Sent ${tx.value ? web3.utils.fromWei(tx.value, 'ether') : '0'} ${tokenName}</p>
            <p>Hash: <a href="${explorer}${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a></p>
        `;
        document.getElementById('Transaction_status').innerHTML = "<p style='color:green'>Transaction Successful!</p>";
    } catch (err) {
        console.error(err);
        document.getElementById('Transaction_status').innerHTML = `<p style="color:red">Failed: ${err.message}</p>`;
    }
}

// Keep all your existing functions: downloadWalletInfo, sendData, etc.
// They will continue working perfectly

function downloadWalletInfo() {
    const info = `Network: ${currentChain.name}\nAddress: ${account.address}\nPrivate Key: ${account.privateKey}\nWarning: Keep this private!`;
    const blob = new Blob([info], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-${currentChain.native}-${account.address.slice(0,8)}.txt`;
    a.click();
}

const send = async (fromAddress, toAddress, amount, privateKey, ContractAddress) => {
    let tx, gasLimit, Tokenname;
    const gasPrice = await web3.eth.getGasPrice();
    if (ContractAddress == null) {
        Tokenname = "ETH"
        gasLimit = 10000;
        tx = {
            from: fromAddress,
            to: toAddress,
            value: web3.utils.toWei(amount, 'ether'),
            gas: gasLimit,
            gasPrice: gasPrice
        };
    } else {
        const Contract = new web3.eth.Contract(erc20Abi, ContractAddress);
        const amountInWei = web3.utils.toWei(amount, 'mwei');
        const txc = Contract.methods.transfer(toAddress, amountInWei);
        const data = txc.encodeABI();
        gasLimit = await txc.estimateGas({ from: account.address });
        Tokenname = await Contract.methods.name().call();

        tx = {
            from: fromAddress,
            to: ContractAddress,
            value: web3.utils.toWei('0', 'ether'),
            gas: gasLimit,
            gasPrice: gasPrice,
            data: data
        };
    }
    const estimatedFee = web3.utils.fromWei((BigInt(gasLimit) * BigInt(gasPrice)).toString(), 'ether');
    console.log(`Estimated transaction fee: ${estimatedFee} ETH`);
    console.log(`Estimated gasLimit: ${gasLimit} gwei`);
    console.log(`Estimated gasPric: ${gasPrice} gwei`);
    const confirmation = confirm(`You are about to send ${amount} ${Tokenname} to ${toAddress}.\n Estimated fee: ${estimatedFee} ETH.\n Do you want to proceed?`);
    if (confirmation) {
        try {
            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', hash => {
                    const transactionHash = hash;
                    document.getElementById('transaction').innerHTML = `
                        <p>Transaction Hash: ${transactionHash}</p>
                        <p><a href="${explorer}${transactionHash}" target="_blank">View on Etherscan</a></p>
                    `;
                    document.getElementById('Transaction_status').innerHTML = "<p>Transaction status: Pending</p>"

                })
                .on('receipt', receipt => {
                    document.getElementById('Transaction_status').innerHTML = "<p>Transaction status: Success</p>"

                })
                .on('error', error => {
                    const transactionHash = error;
                    document.getElementById('Transaction_status').innerHTML = "<p>Transaction status: Error</p>"

                });
        } catch (error) {
            console.error('Error signing transaction:', error);
        }
    } else {
        console.log('Transaction cancelled.');
    }
};

// Data sending functions
function toggleDataAddress() {
    const sendToSelf = document.getElementById('sendToSelf').checked;
    const dataToAddress = document.getElementById('dataToAddress');

    if (sendToSelf) {
        dataToAddress.disabled = true;
        dataToAddress.value = account ? account.address : '';
        dataToAddress.placeholder = 'Will be sent to your own address';
    } else {
        dataToAddress.disabled = false;
        dataToAddress.value = '';
        dataToAddress.placeholder = 'Enter recipient address';
    }
}

async function sendData() {
    checkBalance();
    const dataMessage = document.getElementById('dataMessage').value;
    const sendToSelf = document.getElementById('sendToSelf').checked;
    let dataToAddress = document.getElementById('dataToAddress').value;

    if (!dataMessage) {
        alert('Please enter a message');
        return;
    }

    if (sendToSelf || !dataToAddress) {
        dataToAddress = account.address;
    }

    if (dataToAddress !== account.address && !web3.utils.isAddress(dataToAddress)) {
        alert('Invalid address');
        return;
    }

    if (confirm("Do you want to send this data to the blockchain?")) {
        await sendDataToBlockchain(account.address, dataToAddress, dataMessage, account.privateKey);
    }
}

const sendDataToBlockchain = async (fromAddress, toAddress, message, privateKey) => {
    try {
        let hexData;
        if (message.startsWith('0x')) {
            hexData = message;
        } else {
            hexData = web3.utils.asciiToHex(message);
        }

        const gasPrice = await web3.eth.getGasPrice();

        const gasEstimate = await web3.eth.estimateGas({
            from: fromAddress,
            to: toAddress,
            value: '0',
            data: hexData
        });

        const tx = {
            from: fromAddress,
            to: toAddress,
            value: '0',
            data: hexData,
            gas: gasEstimate,
            gasPrice: gasPrice
        };

        const estimatedFee = web3.utils.fromWei((BigInt(gasEstimate) * BigInt(gasPrice)).toString(), 'ether');

        const destination = toAddress === fromAddress ? 'your own address' : toAddress;
        const confirmation = confirm(`You are about to send data to the blockchain.\nData: ${message}\nTo: ${destination}\nEstimated fee: ${estimatedFee} ETH.\nDo you want to proceed?`);

        if (confirmation) {
            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', hash => {
                    document.getElementById('dataTransaction').innerHTML = `
                        <p>Transaction Hash: ${hash}</p>
                        <p>Data: ${message}</p>
                        <p>To: ${destination}</p>
                        <p><a href="${explorer}${hash}" target="_blank">View on Etherscan</a></p>
                    `;
                    document.getElementById('dataTransaction_status').innerHTML = "<p>Transaction status: Pending</p>";
                })
                .on('receipt', receipt => {
                    document.getElementById('dataTransaction_status').innerHTML = "<p>Transaction status: Success</p>";
                    console.log('Transaction receipt:', receipt);
                })
                .on('error', error => {
                    document.getElementById('dataTransaction_status').innerHTML = "<p>Transaction status: Error</p>";
                    console.error('Transaction error:', error);
                });
        }
    } catch (error) {
        console.error('Error sending data:', error);
        alert('Error sending data: ' + error.message);
    }
};

function updateDataUI() {
    const sendToSelfCheckbox = document.getElementById('sendToSelf');
    if (sendToSelfCheckbox && sendToSelfCheckbox.checked) {
        toggleDataAddress();
    }
}