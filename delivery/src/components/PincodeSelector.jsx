const PincodeSelector = ({ pincodes = [], selectedPincode, onPincodeChange }) => {
  return (
    <div style={{ margin: "10px 0" }}>
      <label>Select Pincode: </label>
      <select value={selectedPincode} onChange={(e) => onPincodeChange(e.target.value)}>
        <option value="">-- Select --</option>
        {Array.isArray(pincodes) &&
          pincodes.map((p) => (
            <option key={p._id} value={p.pincode}>
              {p.pincode} - {p.city}, {p.state}
            </option>
          ))}
      </select>
    </div>
  );
};


export default PincodeSelector;
