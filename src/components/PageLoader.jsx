import BrainLoader from './BrainLoader';
import './PageLoader.css';

function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader">
      <BrainLoader size={80} label={label} />
    </div>
  );
}

export default PageLoader;
