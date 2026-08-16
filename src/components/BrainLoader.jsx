import brainPng from '../assets/brain.png';
import './BrainLoader.css';

function BrainLoader({ size = 60, label = 'Loading...' }) {
  return (
    <div
      className="brain-loader-wrap"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <img src={brainPng} alt="" className="brain-loader" aria-hidden="true" />
    </div>
  );
}

export default BrainLoader;
