const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ERC20 = await hre.ethers.getContractFactory("ERC20RewardToken");
  const token = await ERC20.deploy("TowerToken", "TWR");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token:", tokenAddress);

  const TD = await hre.ethers.getContractFactory("TowerDefense");
  const game = await TD.deploy(tokenAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("TowerDefense:", gameAddress);

  // set minter to game
  const tx = await token.setMinter(gameAddress);
  await tx.wait();

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);
  const deployed = {
    network: hre.network.name,
    ERC20RewardToken: tokenAddress,
    TowerDefense: gameAddress
  };
  fs.writeFileSync(path.join(deploymentsDir, "deployed.json"), JSON.stringify(deployed, null, 2));

  // export ABI + addresses to frontend
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const erc20ABI = require(path.join(artifactsDir, "ERC20RewardToken.sol", "ERC20RewardToken.json")).abi;
  const tdABI = require(path.join(artifactsDir, "TowerDefense.sol", "TowerDefense.json")).abi;

  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  const abiDir = path.join(frontendDir, "src", "abi");
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });
  fs.writeFileSync(path.join(abiDir, "ERC20RewardToken.json"), JSON.stringify({ abi: erc20ABI }, null, 2));
  fs.writeFileSync(path.join(abiDir, "TowerDefense.json"), JSON.stringify({ abi: tdABI }, null, 2));

  const cfgDir = path.join(frontendDir, "src", "config");
  if (!fs.existsSync(cfgDir)) fs.mkdirSync(cfgDir, { recursive: true });
  fs.writeFileSync(path.join(cfgDir, "contracts.json"), JSON.stringify(deployed, null, 2));

  console.log("Artifacts exported to frontend.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
