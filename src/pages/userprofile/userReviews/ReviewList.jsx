import React from 'react';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import UserReviews from './UserReviews';
import './ReviewList.css';

function ReviewList({ heading, reviews, averageScore, numberOfReviews }) {
  const roundedScore = Math.round(averageScore * 2) / 2;

  const shownStars = () => {
    const stars = [];
    let i;
    for (i = 1; i <= 5; i++) {
      if (i <= roundedScore) {
        stars.push(<FaStar key={i} className="star-icon" />);
      } else if (i === Math.ceil(roundedScore) && roundedScore % 1 !== 0) {
        stars.push(<FaStarHalf key={i} className="star-icon" />);
      } else {
        stars.push(<FaStar key={i} className="star-empty" />);
      }
    }
    return stars;
  };

  return (
    <div className='reviews'>
      <h2>{heading}</h2>
      <div className="average-stars">
        <p>Average Score: {averageScore.toFixed(1)} / 5 </p>
        <p>({numberOfReviews} review{numberOfReviews !== 1 ? 's' : ''})</p>
        <div className="stars">
          {shownStars()}
        </div>
      </div>
      <div className="review-list">
        <h3>Reviews</h3>
        {reviews.map(reviewDetails => (
          <UserReviews key={reviewDetails.id} reviewDetails={reviewDetails} />
        ))}
      </div>
    </div>
  );
}

export default ReviewList;