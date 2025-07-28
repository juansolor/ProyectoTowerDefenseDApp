# Tower Defense DApp (React + Solidity + FastAPI)

Starter kit para un minijuego **Tower Defense** con recompensas en **ERC20 (TowerToken - TWR)**, chat global por **WebSocket**, y despliegue local (Hardhat) y Testnet (Goerli).

## Estructura
```
/contracts     # Hardhat + Solidity (ERC20 + TowerDefense)
/frontend      # React + Ethers + Framer Motion + Chat WebSocket
/backend       # FastAPI + WebSocket + SQLite (ranking)
```

## Requisitos
- Node.js 18+ y npm
- Python 3.10+ y pip
- MetaMask en el navegador
- (Opcional) Cuenta en Alchemy/Infura para RPC de Goerli

## Pasos rápidos

### 1) Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- API: http://localhost:8000
- WS Chat: ws://localhost:8000/ws/chat

### 2) Contratos (Hardhat)
```bash
cd contracts
npm install
npx hardhat compile
# Local node
npx hardhat node
# En otra terminal, despliega a local
npx hardhat run scripts/deploy.js --network localhost
```
Esto generará `contracts/deployments/deployed.json` y copiará direcciones/ABI a `frontend/src/config/contracts.json` y `frontend/src/abi`.

**Goerli (testnet):**
1. Copia `.env.example` a `.env` y completa:
```
GOERLI_RPC_URL=...
PRIVATE_KEY=0xTU_LLAVE_PRIVADA
```
2. Despliega:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

### 3) Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173, conecta MetaMask, construye torres, inicia oleadas y usa el chat.

## Notas
- Recompensas ERC20: `TWR` (TowerToken).
- El contrato `TowerDefense` mintea TWR al ganar oleadas (por defecto 10 TWR).
- Ranking: persistido en SQLite (`backend/app/db.sqlite3`). Puedes reiniciarlo borrando el archivo.
- Archivos preconfigurados para VS Code en `.vscode/`.
```

