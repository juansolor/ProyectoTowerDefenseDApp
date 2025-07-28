import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import contracts from "./config/contracts.json";
import TD from "./abi/TowerDefense.json";
import ERC20 from "./abi/ERC20RewardToken.json";
import Chat from "./components/Chat";

export default function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [player, setPlayer] = useState({ score: 0, towers: 0, totalDamage: 0 });
  const [status, setStatus] = useState("");

  const td = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(contracts.TowerDefense, TD.abi, signer);
  }, [signer]);

  const erc20 = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(contracts.ERC20RewardToken, ERC20.abi, signer);
  }, [signer]);

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask no detectado");
      return;
    }
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(prov);
    const accs = await prov.send("eth_requestAccounts", []);
    setAccount(accs[0]);
    setSigner(prov.getSigner());
  }

  async function refresh() {
    if (!td || !account) return;
    try {
      const res = await td.getPlayer(account);
      setPlayer({
        score: Number(res[0]),
        towers: Number(res[1]),
        totalDamage: Number(res[2]),
      });
    } catch (e) {
      setPlayer({ score: 0, towers: 0, totalDamage: 0 });
      setStatus("Regístrate para comenzar a jugar.");
    }
  }

  async function register() {
    if (!td) return;
    const tx = await td.register({ value: ethers.utils.parseEther("0.00001") });
    setStatus("Registrando...");
    await tx.wait();
    setStatus("Registrado");
    await refresh();
  }

  async function buildTower() {
    if (!td) return;
    const tx = await td.buildTower({ value: ethers.utils.parseEther("0.0000002") });
    setStatus("Construyendo torre...");
    await tx.wait();
    setStatus("Torre construida");
    await refresh();
  }

  async function startWave() {
    if (!td) return;
    const tx = await td.startWave();
    setStatus("Iniciando oleada...");
    const receipt = await tx.wait();
    setStatus("Oleada completada");
    await refresh();
  }

  async function balance() {
    if (!erc20 || !account) return "0";
    const bal = await erc20.balanceOf(account);
    return ethers.utils.formatEther(bal);
  }

  useEffect(() => {
    if (signer && account) refresh();
  }, [signer, account]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Tower Defense DApp</h1>
        <button onClick={connect}>{account ? account.slice(0,6) + "..." + account.slice(-4) : "Conectar"}</button>
      </header>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p><strong>Score:</strong> {player.score} | <strong>Torres:</strong> {player.towers} | <strong>Daño Total:</strong> {player.totalDamage}</p>
        <AsyncBalance fetcher={balance} />
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={register}>Registrar</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={buildTower}>Construir Torre</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startWave}>Iniciar Oleada</motion.button>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <p>💬 Chat Global</p>
          <Chat />
        </motion.div>
      </div>

      <motion.div style={{ marginTop: 24, border: "1px dashed #aaa", height: 240, borderRadius: 8, position: "relative" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <motion.div style={{ position: "absolute", left: 20, top: 100 }} animate={{ x: [0, 600] }} transition={{ repeat: Infinity, duration: 6 }}>
          👾
        </motion.div>
        <motion.div style={{ position: "absolute", right: 20, bottom: 20, fontSize: 24 }} whileHover={{ rotate: [0, -5, 5, 0] }}>
          🏰
        </motion.div>
      </motion.div>

      <p style={{ marginTop: 12, color: "#666" }}>{status}</p>
      <footer style={{ marginTop: 32, fontSize: 12, color: "#888" }}>
        Red actual: requiere despliegue y direcciones en <code>src/config/contracts.json</code> (el script de deploy las escribe).
      </footer>
    </div>
  );
}

function AsyncBalance({ fetcher }) {
  const [v, setV] = useState("0");
  useEffect(() => {
    (async () => {
      try { setV(await fetcher()); } catch(e) {}
    })();
  }, [fetcher]);
  return <p><strong>TWR balance:</strong> {v}</p>;
}
