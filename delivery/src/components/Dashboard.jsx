import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import OrdersList from "./OrdersList";
import BucketPage from "./BucketPage";
import LocationSharing from "./LocationSharing";
import PincodeSelector from "./PincodeSelector";

const API = "http://localhost:5000/api";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [view, setView] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [bucket, setBucket] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState("");

  // fetch pincodes
  useEffect(() => {
axios.get(`${API}/pincodes`).then((res) => setPincodes(res.data.data));
  }, []);

  // fetch orders for selected pincode
  useEffect(() => {
    if (selectedPincode) {
      axios.get(`${API}/orders/available/${selectedPincode}`)
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  }, [selectedPincode]);

  const toggleBucket = async (order) => {
    const inBucket = bucket.some((o) => o._id === order._id);
    const url = `${API}/delivery/bucket/${order._id}/${inBucket ? "remove" : "add"}`;
    await axios.post(url, { riderId: currentUser.id });
    if (inBucket) setBucket(bucket.filter((o) => o._id !== order._id));
    else setBucket([...bucket, order]);
  };

  const updateStatus = async (id, status) => {
    await axios.post(`${API}/orders/${id}/status`, { status, riderId: currentUser.id });
    if (status === "Delivered") {
      const delivered = bucket.find((o) => o._id === id) || orders.find((o) => o._id === id);
      if (delivered) setCompleted([delivered, ...completed]);
      setOrders(orders.filter((o) => o._id !== id));
      setBucket(bucket.filter((o) => o._id !== id));
    }
  };

  return (
    <div>
      <Header user={currentUser} onLogout={logout} />
      <div style={{ margin: "10px 0" }}>
        <button onClick={() => setView("orders")}>Orders</button>
        <button onClick={() => setView("bucket")}>Bucket ({bucket.length})</button>
        <button onClick={() => setView("completed")}>Completed ({completed.length})</button>
      </div>

      <LocationSharing user={currentUser} />

      <PincodeSelector pincodes={pincodes} selectedPincode={selectedPincode} onPincodeChange={setSelectedPincode} />

      {view === "orders" && <OrdersList orders={orders} bucket={bucket} onToggleBucket={toggleBucket} />}
      {view === "bucket" && <BucketPage orders={bucket} onUpdateStatus={updateStatus} onRemove={(id) => setBucket(bucket.filter(o => o._id !== id))} />}
      {view === "completed" && completed.map((o) => <div key={o._id}>Order #{o._id.slice(-6)} Delivered</div>)}
    </div>
  );
};

export default Dashboard;
