import GoogleLogin from './GoogleLogin'; // Demo mode (now default)
import './RealGoogleLogin.css';

const HybridGoogleLogin = ({ onSuccess, onError }) => {
  return (
    <div className="hybrid-google-login">
      {/* Clean Google Login - Demo Mode by default */}
      <GoogleLogin onSuccess={onSuccess} onError={onError} />
    </div>
  );
};

export default HybridGoogleLogin;