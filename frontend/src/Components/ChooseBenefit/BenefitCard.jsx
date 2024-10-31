import React from 'react';
import uCoinLogo from '../../imgs/uCoinLogo.png';

const BenefitCard = ({ benefit, toggleExpand, isUnavailable, available, bgrIcon }) => {
  return (
    <div
      onClick={() => toggleExpand(benefit)}
      className={`benefit-card ${isUnavailable || !available ? 'benefit-card-unavailable' : ''}`}
    >
      <div className='benefit-card-items'>
          <img className='benefit-card-img' src={bgrIcon[benefit.category.photo]} onError={(event) => event.target.style.display = 'none'}/>
          <h4 className="benefit-name">{benefit.name}</h4>
          {benefit.ucoin > 0 && (
            <img src={uCoinLogo} alt='uCoinIcon' className='ucoin-icon' width={'36px'}/>
          )}
      </div>

    </div>
  );
};

export default BenefitCard;
