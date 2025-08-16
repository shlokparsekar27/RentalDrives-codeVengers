import "./Vehicles.css";

function Bikes() {
  const bikes = [
    {
      id: 1,
      name: "Royal Enfield Classic 350",
      price: "₹1000/day",
      type: "Cruiser",
      img: "https://www.royalenfield.com/content/dam/royal-enfield/motorcycles/new-classic-350/studio-shots/360/cammando-sand/01.png" // replace with actual image URL
    },
    {
      id: 2,
      name: "KTM Duke 250",
      price: "₹1200/day",
      type: "Sports",
      img: "https://imgd.aeplcdn.com/1280x720/n/cw/ec/155737/duke-250-right-front-three-quarter-2.jpeg?isig=0"
    },
    {
      id: 3,
      name: "Honda Shine",
      price: "₹600/day",
      type: "Commuter",
      img: "https://imgd.aeplcdn.com/664x374/n/cw/ec/1/versions/honda-shine-drum1751549564957.jpg?q=80"
    },
  ];

  const handleBooking = (vehicleName) => {
    alert(`Booking for ${vehicleName} is coming soon! 🏍️`);
  };

  return (
    <div className="vehicles-container">
      <h2>Available Bikes 🏍️</h2>
      <ul className="vehicle-list">
        {bikes.map((bike) => (
          <li key={bike.id} className="vehicle-card">
            <img src={bike.img} alt={bike.name} className="vehicle-image" />
            <div className="vehicle-info">
              <strong>{bike.name}</strong>
              <span>{bike.price}</span>
              <span>{bike.type}</span>
            </div>
            <button
              className="book-btn"
              onClick={() => handleBooking(bike.name)}
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

export default Bikes;

