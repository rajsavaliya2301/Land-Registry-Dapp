let web3;
let accounts = [];
let landRegistry;

const statusBar = document.getElementById("statusBar");
const walletInfo = document.getElementById("walletInfo");
const networkInfo = document.getElementById("networkInfo");
const landDetails = document.getElementById("landDetails");
const verifyResult = document.getElementById("verifyResult");
const landTableBody = document.getElementById("landTableBody");

function setStatus(message, isError = false) {
  statusBar.textContent = message;
  statusBar.style.color = isError ? "#b00020" : "#2c4f74";
  statusBar.style.borderColor = isError ? "#f5b2b2" : "#c7defa";
  statusBar.style.background = isError ? "#fff2f2" : "#eef6ff";
}

async function loadContract() {
  const response = await fetch("../build/contracts/LandRegistry.json");
  const artifact = await response.json();

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = artifact.networks[networkId];

  if (!deployedNetwork) {
    throw new Error(
      `LandRegistry contract not deployed on network id ${networkId}. Run: truffle migrate --network development --reset`
    );
  }

  landRegistry = new web3.eth.Contract(artifact.abi, deployedNetwork.address);
  networkInfo.textContent = `Network: ${networkId} | Contract: ${deployedNetwork.address}`;
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus("MetaMask not found. Install MetaMask and connect to Ganache.", true);
    return;
  }

  try {
    web3 = new Web3(window.ethereum);
    accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    walletInfo.textContent = `Wallet: ${accounts[0]}`;

    await loadContract();
    await refreshLandTable();

    setStatus("Wallet connected and contract loaded.");
  } catch (error) {
    setStatus(error.message || "Failed to connect wallet.", true);
  }
}

async function registerLand(event) {
  event.preventDefault();

  if (!landRegistry || accounts.length === 0) {
    setStatus("Connect wallet first.", true);
    return;
  }

  const id = document.getElementById("landId").value;
  const location = document.getElementById("landLocation").value.trim();
  const area = document.getElementById("landArea").value;

  try {
    setStatus("Registering land on blockchain...");
    await landRegistry.methods.registerLand(id, location, area).send({ from: accounts[0] });
    setStatus(`Land ${id} registered successfully.`);
    event.target.reset();
    await refreshLandTable();
  } catch (error) {
    setStatus(error.message || "Failed to register land.", true);
  }
}

async function transferLand(event) {
  event.preventDefault();

  if (!landRegistry || accounts.length === 0) {
    setStatus("Connect wallet first.", true);
    return;
  }

  const landId = document.getElementById("transferLandId").value;
  const newOwner = document.getElementById("newOwner").value.trim();

  try {
    setStatus("Submitting transfer transaction...");
    await landRegistry.methods.transferLand(landId, newOwner).send({ from: accounts[0] });
    setStatus(`Land ${landId} transferred to ${newOwner}.`);
    event.target.reset();
    await refreshLandTable();
  } catch (error) {
    setStatus(error.message || "Transfer failed.", true);
  }
}

async function verifyOwnership(event) {
  event.preventDefault();

  if (!landRegistry) {
    setStatus("Connect wallet first.", true);
    return;
  }

  const landId = document.getElementById("verifyLandId").value;
  const claimant = document.getElementById("claimant").value.trim();

  try {
    const isOwner = await landRegistry.methods.verifyOwnership(landId, claimant).call();
    verifyResult.textContent = isOwner
      ? `Verified: ${claimant} is the owner of Land ${landId}.`
      : `Not verified: ${claimant} is not the owner of Land ${landId}.`;
    setStatus("Ownership verification complete.");
  } catch (error) {
    setStatus(error.message || "Verification failed.", true);
  }
}

async function fetchLandDetails(event) {
  event.preventDefault();

  if (!landRegistry) {
    setStatus("Connect wallet first.", true);
    return;
  }

  const landId = document.getElementById("fetchLandId").value;

  try {
    const land = await landRegistry.methods.getLand(landId).call();
    const payload = {
      id: land.id,
      location: land.location,
      areaSqFt: land.areaSqFt,
      owner: land.owner
    };

    landDetails.textContent = JSON.stringify(payload, null, 2);
    setStatus(`Fetched details for Land ${landId}.`);
  } catch (error) {
    setStatus(error.message || "Could not fetch land details.", true);
  }
}

async function refreshLandTable() {
  if (!landRegistry) {
    landTableBody.innerHTML = '<tr><td colspan="4">Connect wallet to load lands.</td></tr>';
    return;
  }

  try {
    const allIds = await landRegistry.methods.getAllLandIds().call();

    if (allIds.length === 0) {
      landTableBody.innerHTML = '<tr><td colspan="4">No records yet.</td></tr>';
      return;
    }

    const rows = await Promise.all(
      allIds.map(async (id) => {
        const land = await landRegistry.methods.getLand(id).call();
        return `
          <tr>
            <td>${land.id}</td>
            <td>${land.location}</td>
            <td>${land.areaSqFt}</td>
            <td>${land.owner}</td>
          </tr>
        `;
      })
    );

    landTableBody.innerHTML = rows.join("");
  } catch (error) {
    landTableBody.innerHTML = '<tr><td colspan="4">Unable to load records.</td></tr>';
    setStatus(error.message || "Failed to refresh table.", true);
  }
}

window.addEventListener("load", () => {
  document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
  document.getElementById("registerForm").addEventListener("submit", registerLand);
  document.getElementById("transferForm").addEventListener("submit", transferLand);
  document.getElementById("verifyForm").addEventListener("submit", verifyOwnership);
  document.getElementById("fetchLandForm").addEventListener("submit", fetchLandDetails);
  document.getElementById("refreshLandsBtn").addEventListener("click", refreshLandTable);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (updatedAccounts) => {
      accounts = updatedAccounts;
      walletInfo.textContent = updatedAccounts[0] ? `Wallet: ${updatedAccounts[0]}` : "Wallet: Not Connected";
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }
});
