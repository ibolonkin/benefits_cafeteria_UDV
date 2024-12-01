import React from 'react';
import uCoinLogo from '../../imgs/uCoinLogo.png';
import noPhotoIcon from '../../imgs/noPhotoMoc.png'

const BenefitCard = ({ benefit, toggleExpand, onCardClick ,isUnavailable, available, bgrIcon }) => {
  const handleClick = () => {
    toggleExpand(benefit);
    onCardClick(benefit.uuid);
  }
  return (
    <div
      onClick={handleClick}
      className={`benefit-card ${isUnavailable || !available ? 'benefit-card-unavailable' : ''}`}
    >
      <div className='benefit-card-items'>
        {benefit.category ? (
          <img className='benefit-card-img' src={benefit.category.photo ? bgrIcon[benefit.category.photo] : noPhotoIcon} alt=''/>
        ) : (
          <img className='benefit-card-img' src={noPhotoIcon} alt=''/>
        )}
          
          <h4 className="benefit-name">{benefit.name}</h4>
          {benefit.ucoin > 0 && (
            <img src={uCoinLogo} alt='uCoinIcon' className='ucoin-icon' width={'36px'}/>
          )}
      </div>

    </div>
  );
};

export default BenefitCard;
