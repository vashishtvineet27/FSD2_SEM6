import React, { useEffect, useState } from "react";

// ---------------- GRAPHQL ----------------
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

const client = new ApolloClient({
  uri: import.meta.env.VITE_API_URL || "http://localhost:4000",
  cache: new InMemoryCache(),
});

const GET_USERS = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

// ---------------- FIREBASE ----------------
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
};

const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

// ---------------- SOCKET.IO ----------------
import io from "socket.io-client";
const socket = io("http://localhost:3000");

// ---------------- WEB3 ----------------
import Web3 from "web3";

// ---------------- COMPONENTS ----------------

// GraphQL Users
function GraphQLUsers() {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading GraphQL...</p>;
  if (error) return <p>Error fetching users</p>;

  return (
    <div>
      <h2>GraphQL Users</h2>
      {data.users.map((u) => (
        <p key={u.id}>{u.name} - {u.email}</p>
      ))}
    </div>
  );
}

// Firebase
function FirebaseSection() {
  const [user, setUserData] = useState(null);

  useEffect(() => {
    const userRef = ref(db, "users/user1");
    onValue(userRef, (snapshot) => {
      setUserData(snapshot.val());
    });
  }, []);

  const addUser = () => {
    set(ref(db, "users/user1"), {
      name: "Alice",
      email: "alice@example.com",
    });
  };

  return (
    <div>
      <h2>Firebase</h2>
      {user && <p>{user.name} - {user.email}</p>}
      <button onClick={addUser}>Add Firebase User</button>
    </div>
  );
}

// Web3 Wallet
function Web3Section() {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("Install MetaMask");
    }
  };

  return (
    <div>
      <h2>Web3 Wallet</h2>
      <button onClick={connectWallet}>Connect</button>
      <p>{account}</p>
    </div>
  );
}

// Chat (Socket.IO)
function ChatSection() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = () => {
    socket.emit("message", msg);
    setMsg("");
  };

  return (
    <div>
      <h2>Realtime Chat</h2>
      <input value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button onClick={sendMessage}>Send</button>

      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
}

// AI Example (API call)
function AISection() {
  const [response, setResponse] = useState("");

  const askAI = async () => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_OPENAI_KEY",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello AI!" }],
      }),
    });

    const data = await res.json();
    setResponse(data.choices?.[0]?.message?.content || "No response");
  };

  return (
    <div>
      <h2>AI Section</h2>
      <button onClick={askAI}>Ask AI</button>
      <p>{response}</p>
    </div>
  );
}

// ---------------- MAIN APP ----------------

function App() {
  // PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker Registered"))
        .catch(() => console.log("SW failed"));
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <div style={{ padding: 20 }}>
        <h1>🔥 Ultimate Full Stack App</h1>

        <GraphQLUsers />
        <FirebaseSection />
        <Web3Section />
        <ChatSection />
        <AISection />
      </div>
    </ApolloProvider>
  );
}

export default App;