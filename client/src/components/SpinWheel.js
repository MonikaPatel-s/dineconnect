import React, { useState, useRef, useEffect } from 'react';
import './SpinWheel.css';

// Global spin count key in localStorage
const GLOBAL_SPIN_COUNT_KEY = 'dineconnect_total_spins';

// Get special milestone prize based on total spin count
function getMilestonePrize(totalSpins) {
  if (totalSpins % 60000 === 0 && totalSpins > 0) return null; // Reset cycle at 60000
  const cycle = totalSpins % 60000;
  if (cycle === 10000) return { discount: 50, text: '🎊 JACKPOT 50%', color: '#FFD93D', isMilestone: true };
  if (cycle === 20000) return { discount: 20, text: '🎉 MILESTONE 20%', color: '#4ECDC4', isMilestone: true };
  if (cycle === 30000) return { discount: 30, text: '🎉 MILESTONE 30%', color: '#45B7D1', isMilestone: true };
  if (cycle === 40000) return { discount: 40, text: '🎉 MILESTONE 40%', color: '#96CEB4', isMilestone: true };
  if (cycle === 50000) return { discount: 50, text: '🎊 JACKPOT 50%', color: '#FFD93D', isMilestone: true };
  return null;
}

const SpinWheel = ({ onClose, onWin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState(null);
  const [totalSpins, setTotalSpins] = useState(0);
  const [alreadySpunToday, setAlreadySpunToday] = useState(false);
  const wheelRef = useRef(null);

  // Normal prizes - shuffled every spin
  const normalPrizes = [
    { discount: 5, text: '5% OFF', color: '#FF6B6B' },
    { discount: 10, text: '10% OFF', color: '#4ECDC4' },
    { discount: 15, text: '15% OFF', color: '#45B7D1' },
    { discount: 5, text: '5% OFF', color: '#96CEB4' },
    { discount: 10, text: '10% OFF', color: '#FFEAA7' },
    { discount: 15, text: '15% OFF', color: '#DDA0DD' },
    { discount: 5, text: '5% OFF', color: '#FD79A8' },
    { discount: 10, text: '10% OFF', color: '#FFD93D' },
  ];

  // Shuffle array
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const [wheelPrizes] = useState(() => shuffle(normalPrizes));

  const segmentAngle = 360 / wheelPrizes.length;

  useEffect(() => {
    // Load total spins
    const saved = parseInt(localStorage.getItem(GLOBAL_SPIN_COUNT_KEY) || '0');
    setTotalSpins(saved);

    // Check if already spun today
    const lastSpinDate = localStorage.getItem('last_spin_date');
    const today = new Date().toDateString();
    if (lastSpinDate === today) {
      setAlreadySpunToday(true);
      setHasSpun(true);
    }
  }, []);

  const spinWheel = () => {
    if (isSpinning || hasSpun || alreadySpunToday) return;

    setIsSpinning(true);

    const newTotalSpins = totalSpins + 1;
    setTotalSpins(newTotalSpins);
    localStorage.setItem(GLOBAL_SPIN_COUNT_KEY, newTotalSpins.toString());
    localStorage.setItem('last_spin_date', new Date().toDateString());

    // Check milestone
    const milestonePrize = getMilestonePrize(newTotalSpins);

    const minRotations = 5;
    const maxRotations = 10;
    const rotations = minRotations + Math.random() * (maxRotations - minRotations);

    let winningIndex;
    let winningPrize;

    if (milestonePrize) {
      // Milestone - land on first segment but override prize
      winningIndex = 0;
      winningPrize = milestonePrize;
    } else {
      winningIndex = Math.floor(Math.random() * wheelPrizes.length);
      winningPrize = wheelPrizes[winningIndex];
    }

    const winningAngle = winningIndex * segmentAngle;
    const totalRotation = rotations * 360 + (360 - winningAngle);

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setResult(winningPrize);
      if (onWin) onWin(winningPrize);
    }, 4000);
  };

  const getNextMilestone = () => {
    const cycle = totalSpins % 60000;
    const milestones = [10000, 20000, 30000, 40000, 50000];
    const next = milestones.find(m => m > cycle);
    if (!next) return { spins: 60000 - cycle, discount: 10 };
    return { spins: next - cycle, discount: next === 10000 || next === 50000 ? 50 : next / 1000 };
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="spin-wheel-overlay">
      <div className="spin-wheel-modal">
        <div className="spin-wheel-header">
          <h2>🎡 Spin & Win!</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>



        <div className="spin-wheel-container">
          <div className="wheel-wrapper">
            <div ref={wheelRef} className="wheel">
              {wheelPrizes.map((prize, index) => (
                <div
                  key={index}
                  className="wheel-segment"
                  style={{
                    transform: `rotate(${index * segmentAngle}deg)`,
                    backgroundColor: prize.color,
                  }}
                >
                  <div className="segment-text">{prize.text}</div>
                </div>
              ))}
            </div>
            <div className="wheel-pointer">▼</div>
          </div>

          {alreadySpunToday && !result ? (
            <div className="already-spun-msg">
              ⏰ Aaj ke liye spin kar chuke ho!<br />
              <small>Kal wapas aao nayi kismat ke saath 🙏</small>
            </div>
          ) : !hasSpun ? (
            <button
              className={`spin-button ${isSpinning ? 'spinning' : ''}`}
              onClick={spinWheel}
              disabled={isSpinning}
            >
              {isSpinning ? '🎡 Spinning...' : '🎯 SPIN NOW!'}
            </button>
          ) : null}

          {result && (
            <div className="spin-result">
              <div className="result-animation">
                <div className="confetti">🎉</div>
                <div className="result-text">
                  {result.isMilestone
                    ? `🎊 MILESTONE ACHIEVED! ${result.discount}% OFF!`
                    : `🎊 You won ${result.discount}% OFF!`}
                </div>
                <p className="result-note">Discount automatically applied to your order!</p>
              </div>
            </div>
          )}
        </div>

        <div className="spin-wheel-rules">
          <h4>🎮 Rules:</h4>
          <ul>
            <li>🎡 Ek din mein sirf ek spin</li>
            <li>🎁 Normal prizes: 5%, 10%, 15% shuffle hoke aate hain</li>
            <li>🏆 10,000 spins pe 50% OFF special prize</li>
            <li>📈 20k=20%, 30k=30%, 40k=40%, 50k=50%</li>
            <li>🔄 60,000 ke baad cycle restart hoti hai</li>
          </ul>
        </div>

        {hasSpun && (
          <div className="spin-wheel-actions">
            <button className="continue-btn" onClick={onClose}>
              🛒 Order Karo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
