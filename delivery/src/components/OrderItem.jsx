// components/OrderItem.jsx
const OrderItem = ({ order, currentUser, onToggleBucket, onUpdateStatus }) => {
  // Decide bucket button label
  let bucketLabel = "Add to Bucket";
  if (order.inBucket) {
    if (order.assignedTo?.riderId?._id === currentUser?.id) {
      bucketLabel = "Already in your list";
    } else {
      bucketLabel = `Already in bucket of ${order.assignedTo?.riderId?.name || "another rider"}`;
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", margin: "8px 0", padding: "8px" }}>
      <h4>Order #{order._id.slice(-6)}</h4>
      <p>
        <strong>Customer:</strong> {order.user?.name} ({order.user?.mobile})
      </p>
      <p>
        <strong>Items:</strong> {order.items?.length || 0}
      </p>
      <p>
        <strong>Total:</strong> ₹{order.totalAmount}
      </p>
      <p>
        <strong>Status:</strong> {order.orderStatus}
      </p>
      <p>
        <strong>Address:</strong>{" "}
        {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
      </p>

      {onToggleBucket && (
        <button
          onClick={onToggleBucket}
          disabled={order.inBucket && order.assignedTo?.riderId?._id !== currentUser?.id} // disable if another rider
        >
          {bucketLabel}
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
