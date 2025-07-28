import React, { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/chat");
    ws.onopen = () => console.log("Chat conectado");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          setMessages((prev) => [...prev, { user: data.user, message: data.message }]);
        }
      } catch (e) {}
    };
    ws.onclose = () => console.log("Chat desconectado");
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  function send() {
    if (!text.trim()) return;
    const payload = JSON.stringify({ type: "chat", user: "player", message: text });
    wsRef.current?.send(payload);
    setText("");
  }

  return (
    <div>
      <div style={{ height: 120, overflowY: "auto", border: "1px solid #eee", padding: 8, marginBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.user}:</strong> {m.message}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex: 1 }} />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  );
}
