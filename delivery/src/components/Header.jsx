import { useAuth } from "../context/AuthContext";

const Header = ({ user, onLogout }) => {
  const { currentUser } = useAuth();

  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#f5f5f5" }}>
      <h2>🚚 Delivery Dashboard</h2>
      {currentUser && (
        <div>
          <span style={{ marginRight: "15px" }}>Hi, {user.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header;
