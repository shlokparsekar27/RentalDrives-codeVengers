// src/pages/HostDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import "./Vehicles.css"; // We can reuse the same styles

// Function to fetch the host's own vehicles
const fetchMyVehicles = async (userId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('host_id', userId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

function HostDashboard() {
  const { user } = useAuth();

  const { data: myVehicles, isLoading, isError } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: () => fetchMyVehicles(user.id),
  });

  if (isLoading) {
    return <div className="vehicles-container"><h2>Loading Your Vehicles...</h2></div>;
  }

  if (isError) {
    return <div className="vehicles-container"><h2>Error fetching your vehicles.</h2></div>;
  }

  return (
    <div className="vehicles-container">
      <div className="dashboard-header">
        <h2>Host Dashboard</h2>
        <Link to="/host/add-vehicle" className="add-vehicle-btn">
            + Add New Vehicle
        </Link>
      </div>
      <h3>Your Vehicle Listings</h3>
      {myVehicles && myVehicles.length > 0 ? (
        <ul className="vehicle-list">
          {myVehicles.map((vehicle) => (
            <li key={vehicle.id} className="vehicle-card">
              <img
                src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="vehicle-image"
              />
              <div className="vehicle-info">
                <strong>{vehicle.make} {vehicle.model}</strong>
                <span>Status: <span className={`status-${vehicle.status}`}>{vehicle.status}</span></span>
                <span>₹{vehicle.price_per_day}/day</span>
              </div>
              {/* We will add Edit/Delete buttons here later */}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not listed any vehicles yet.</p>
      )}
    </div>
  );
}

export default HostDashboard;