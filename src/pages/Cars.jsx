import "./Vehicles.css";

function Cars() {
  return (
    <div className="vehicles-container">
      <h2>Available Cars 🚗</h2>
      <ul className="vehicle-list">
        <li className="vehicle-card">
          <img
            src="https://www.autovista.in/assets/img/new_cars_colour_variants/swift-colour-solid-fire-red.jpg"
            alt="Maruti Swift"
            className="vehicle-image"
          />
          <div className="vehicle-info">
            <strong>Maruti Swift</strong>
            <span>₹1200/day</span>
            <span>Petrol | Seats: 5</span>
          </div>
          <button className="book-btn">Book Now</button>
        </li>

        <li className="vehicle-card">
          <img
            src="https://www.carandbike.com/_next/image?url=https%3A%2F%2Fimages.carandbike.com%2Fcms%2Farticles%2F2024%2F4%2F3205535%2FHyundai_Creta_long_term_24_e29189f639.jpg&w=3840&q=75"
            alt="Hyundai Creta"
            className="vehicle-image"
          />
          <div className="vehicle-info">
            <strong>Hyundai Creta</strong>
            <span>₹2200/day</span>
            <span>Diesel | Seats: 5</span>
          </div>
          <button className="book-btn">Book Now</button>
        </li>

        <li className="vehicle-card">
          <img
            src="https://www.team-bhp.com/sites/default/files/styles/amp_high_res/public/mahindra-thar-modifications-22.jpeg"
            alt="Mahindra Thar"
            className="vehicle-image"
          />
          <div className="vehicle-info">
            <strong>Mahindra Thar</strong>
            <span>₹3000/day</span>
            <span>Diesel | Seats: 4</span>
          </div>
          <button className="book-btn">Book Now</button>
        </li>
      </ul>

      
    </div>
  );
}

export default Cars;



