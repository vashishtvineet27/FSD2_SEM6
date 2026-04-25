import React, { useEffect, useState } from "react";

// Apollo GraphQL
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

// Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Web3
import Web3 from "web3";

// Socket.IO
import io from "socket.io-client";

// -------------------- CONFIG -------------------- //

// GraphQL Client
const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

// GraphQL Query
const GET_USERS = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Socket
const socket = io("http://localhost:3000");

// -------------------- COMPONENTS -------------------- //

// GraphQL Component
function GraphQLUsers() {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading GraphQL...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div>
      <h2>GraphQL Users</h2>
      {data.users.map((u) => (
        <p key={u.id}>{u.name} - {u.email}</p>
      ))}
    </div>
  );
}

// Firebase Component
function FirebaseData() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userRef = ref(db, "users/user1");

    onValue(userRef, (snapshot) => {
      setUser(snapshot.val());
    });
  }, []);

  const addUser = () => {
    set(ref(db, "users/user1"), {
      name: "John",
      email: "john@example.com",
    });
  };

  return (
    <div>
      <h2>Firebase Data</h2>
      {user && <p>{user.name} - {user.email}</p>}
      <button onClick={addUser}>Add User</button>
    </div>
  );
}

// Web3 Component
function Web3Info() {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    }
  };

  return (
    <div>
      <h2>Web3 Wallet</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>{account}</p>
    </div>
  );
}

// Socket.IO Chat
function Chat() {
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
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>

      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
}

// -------------------- MAIN APP -------------------- //

function App() {
  // PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch(() => console.log("SW failed"));
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <div style={{ padding: 20 }}>
        <h1>🚀 All-in-One Web Tech App</h1>

        <GraphQLUsers />
        <FirebaseData />
        <Web3Info />
        <Chat />
      </div>
    </ApolloProvider>
  );
}

export default App;