// Utility if you want to export ABI manually after compile
const fs = require('fs');
const path = require('path');

function main() {
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  const abiDir = path.join(frontendDir, "src", "abi");
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });

  const erc20 = require(path.join(artifactsDir, "ERC20RewardToken.sol", "ERC20RewardToken.json")).abi;
  const td = require(path.join(artifactsDir, "TowerDefense.sol", "TowerDefense.json")).abi;
  fs.writeFileSync(path.join(abiDir, "ERC20RewardToken.json"), JSON.stringify({ abi: erc20 }, null, 2));
  fs.writeFileSync(path.join(abiDir, "TowerDefense.json"), JSON.stringify({ abi: td }, null, 2));
  console.log("ABI exported.");
}
main();
