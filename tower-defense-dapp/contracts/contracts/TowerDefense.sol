// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

contract TowerDefense {
    struct Player {
        uint256 score;
        uint256 towers;
        uint256 totalDamage;
    }

    mapping(address => Player) public players;

    address public owner;
    IRewardToken public rewardToken;
    uint256 public rewardPerWin = 10 ether; // 10 TWR (18 decimals)

    event Registered(address indexed player);
    event TowerBuilt(address indexed player, uint256 towers, uint256 totalDamage);
    event WaveResult(address indexed player, bool win, uint256 newScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _rewardToken) {
        owner = msg.sender;
        rewardToken = IRewardToken(_rewardToken);
    }

    function setRewardPerWin(uint256 amount) external onlyOwner {
        rewardPerWin = amount;
    }

    function register() external payable {
        require(msg.value >= 0.00001 ether, "Se requieren 0.00001 ETH para registrarse");
        players[msg.sender] = Player(0, 0, 0);
        emit Registered(msg.sender);
    }

    function buildTower() external payable {
        require(msg.value >= 0.0000002 ether, "Se requieren 0.0000002 ETH para construir torre");
        Player storage p = players[msg.sender];
        require(p.towers < 100, "too many towers");
        p.towers += 1;
        // cada torre agrega 15 de daño base
        p.totalDamage += 15;
        emit TowerBuilt(msg.sender, p.towers, p.totalDamage);
    }

    function startWave() external returns (bool win) {
        Player storage p = players[msg.sender];
        require(p.towers > 0, "No towers");
        // dificultad basada en score
        uint256 enemyHP = 30 + (p.score * 10);
        if (p.totalDamage >= enemyHP) {
            p.score += 1;
            rewardToken.mint(msg.sender, rewardPerWin);
            emit WaveResult(msg.sender, true, p.score);
            return true;
        } else {
            emit WaveResult(msg.sender, false, p.score);
            return false;
        }
    }

    function getPlayer(address who) external view returns (uint256, uint256, uint256) {
        Player memory p = players[who];
        return (p.score, p.towers, p.totalDamage);
    }
}
