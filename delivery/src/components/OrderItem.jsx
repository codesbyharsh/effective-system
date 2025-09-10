const OrderItem = ({ order, inBucket, onToggleBucket, onUpdateStatus }) => {
  return (
    <div style={{ border: "1px solid #ccc", margin: "8px 0", padding: "8px" }}>
      <h4>Order #{order._id.slice(-6)}</h4>
      <p><strong>Customer:</strong> {order.user?.name} ({order.user?.phone})</p>
      <p><strong>Items:</strong> {order.items?.length || 0}</p>
      <p><strong>Total:</strong> ₹{order.totalAmount}</p>
      <p><strong>Status:</strong> {order.orderStatus}</p>
      <p><strong>Address:</strong> {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}</p>

      {onToggleBucket && (
        <button onClick={onToggleBucket}>
          {inBucket ? "Remove from Bucket" : "Add to Bucket"}
        </button>
      )}

      {onUpdateStatus && (
        <div style={{ marginTop: "6px" }}>
          <button onClick={() => onUpdateStatus(order._id, "Out for Delivery")}>
            Mark Out for Delivery
          </button>
          <button onClick={() => onUpdateStatus(order._id, "Delivered")}>
            Mark Delivered
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
