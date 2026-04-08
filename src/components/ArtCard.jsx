import React from "react";
import { useNavigate } from "react-router-dom";
import "@styles/artcard.css"; // ✅ Import the CSS file

function ArtCard({ art }) {
    const navigate = useNavigate();

    const handleClick = () => {
      navigate(`/art/${art._id}`); 
    };

    // ✅ Map stage to colored text with emoji
    const getStageLabel = () => {
        switch (art.stage) {
            case "approved":
                return <span className="art-stage approved">Approved</span>;
            case "rejected":
                return <span className="art-stage rejected">Rejected</span>;
            case "review":
            default:
                return <span className="art-stage review">Pending</span>;
        }
    };

    return (
      <div onClick={handleClick} className="art-card">
        <div className="art-card-image-container">
          <img src={art.imageLink} alt={art.name} />
        </div>
        
        <div className="art-card-content">
          <div className="art-card-main-info">
            <div className="art-card-text">
              <h3 className="art-card-title">{art.name}</h3>
              <p className="art-card-artist">{art.artistName}</p>
            </div>
            {/* ✅ Status badge aligned with text */}
            <div className="art-stage-container">{getStageLabel()}</div>
          </div>
          
          {/* ✅ Show Reviewer Info if Available */}
          {art.reviewedByEmail && (
            <p className="art-reviewer">
              <strong>Reviewed By:</strong> {art.reviewedByEmail}
            </p>
          )}
        </div>
      </div>
    );
}

export default ArtCard;
