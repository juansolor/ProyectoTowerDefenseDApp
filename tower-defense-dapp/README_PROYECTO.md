# Tower Defense DApp - Guía de uso

## Requisitos
- Node.js 18+ y npm
- Python 3.10+ y pip
- MetaMask en el navegador
- Hardhat (contratos)

## Estructura
- `/contracts`: Hardhat + Solidity (ERC20 + TowerDefense)
- `/frontend`: React + Ethers + Framer Motion + Chat WebSocket
- `/backend`: FastAPI + WebSocket + SQLite (ranking)

## Pasos para correr el proyecto

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- API: http://localhost:8000
- WS Chat: ws://localhost:8000/ws/chat

### 2. Contratos (Hardhat)
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node
# En otra terminal:
npx hardhat run scripts/deploy.js --network localhost
```
Esto genera `contracts/deployments/deployed.json` y copia direcciones/ABI a `frontend/src/config/contracts.json` y `frontend/src/abi`.

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173, conecta MetaMask, construye torres, inicia oleadas y usa el chat.

## Notas
- Importa una cuenta de Hardhat en MetaMask para tener saldo de prueba.
- El contrato `TowerDefense` requiere pagos pequeños en ETH para registrar y construir torres.
- El ranking se guarda en `backend/app/db.sqlite3`.
- Usa la red "Localhost 8545" en MetaMask.

## Para testnet Goerli
1. Copia `.env.example` a `.env` y completa:
```
GOERLI_RPC_URL=...
PRIVATE_KEY=0xTU_LLAVE_PRIVADA
```
2. Despliega:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

---

Actualiza este README si cambias la configuración o los pasos.
