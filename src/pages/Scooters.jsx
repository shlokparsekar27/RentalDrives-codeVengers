import "./Vehicles.css";

function Scooters() {
  const scooters = [
    {
      id: 1,
      name: "Honda Activa 6G",
      price: "₹500/day",
      engine: "110cc",
      img: "https://images.timesdrive.in/photo/msid-151054468,thumbsize-566229,width-560,height-250,false/151054468.jpg" // replace with actual image URL
    },
    {
      id: 2,
      name: "TVS Jupiter",
      price: "₹450/day",
      engine: "110cc",
      img: "https://imgd.aeplcdn.com/1056x594/n/ahvh7eb_1768799.jpg?q=80"
    },
    {
      id: 3,
      name: "Suzuki Access 125",
      price: "₹550/day",
      engine: "125cc",
      img: "https://imgd.aeplcdn.com/664x374/n/cw/ec/1/versions/suzuki-access-125-standard1738074352591.jpg?q=80"
    },
  ];

  const handleBooking = (vehicleName) => {
    alert(`Booking for ${vehicleName} is coming soon! 🛵`);
  };

  return (
    <div className="vehicles-container">
      <h2>Available Scooters 🛵</h2>
      <ul className="vehicle-list">
        {scooters.map((scooter) => (
          <li key={scooter.id} className="vehicle-card">
            <img src={scooter.img} alt={scooter.name} className="vehicle-image" />
            <div className="vehicle-info">
              <strong>{scooter.name}</strong>
              <span>{scooter.price}</span>
              <span>Engine: {scooter.engine}</span>
            </div>
            <button
              className="book-btn"
              onClick={() => handleBooking(scooter.name)}
            >
              Book Now
            </button>
          </li>
        ))}
      </ul>
      <p className="note">
        *Note: This is sample data. Live availability will be fetched from backend later.
      </p>
    </div>
  );
}

export default Scooters;

