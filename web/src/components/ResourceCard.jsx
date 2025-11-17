export default function ResourceCard({ r }) {
  return (
    <div className="card">
      <h3>{r.name}</h3>
      {r.distance != null && <p className="distance">{r.distance} mi away</p>}
      {r.address && <p className="address">{r.address}</p>}
      {r.description && <p>{r.description}</p>}
      <div className="links">
        {r.phone && <a href={`tel:${r.phone}`}>Call</a>}
        {r.directionsUrl && (
          <a href={r.directionsUrl} target="_blank" rel="noreferrer">Directions</a>
        )}
      </div>
    </div>
  );
}
