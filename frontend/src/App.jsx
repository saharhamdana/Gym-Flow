import { useEffect, useState } from "react";
import api from "./api/axiosInstance";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("health/")
      .then((res) => setStatus(res.data.status))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>GymFlow Frontend</h1>
      <p>Connexion au backend : <strong>{status || "..."}</strong></p>
    </div>
  );
}

export default App;
