import React, { useState } from 'react';
import { ReviewDetail, User } from '../types';

const StarIcon: React.FC<{ className?: string; solid: boolean }> = ({ className, solid }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill={solid ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRatingInput: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-yellow-400 focus:outline-none"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <StarIcon
            className="w-8 h-8"
            solid={(hoverRating || rating) >= star}
          />
        </button>
      ))}
    </div>
  );
};


interface ReviewsProps {
  reviews: ReviewDetail[];
  currentUser: User | null;
  onSubmitReview: (review: { rating: number; comment: string }) => void;
  onLoginClick: () => void;
}

const Reviews: React.FC<ReviewsProps> = ({ reviews, currentUser, onSubmitReview, onLoginClick }) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (newComment.trim() === '') {
        setError('Please enter a comment.');
        return;
    }
    setError('');
    onSubmitReview({ rating: newRating, comment: newComment });
    setNewRating(0);
    setNewComment('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-gray mb-6">Customer Reviews</h2>

      {/* Leave a Review Form */}
      <div className="bg-light-gray p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
        {currentUser ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRatingInput rating={newRating} onRatingChange={setNewRating} />
            </div>
            <div className="mb-4">
               <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                id="review-comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="Share your thoughts about the product..."
              ></textarea>
            </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-600">You must be logged in to post a review.</p>
            <button onClick={onLoginClick} className="mt-2 text-brand-blue font-semibold hover:underline">
              Login here
            </button>
          </div>
        )}
      </div>

      {/* Existing Reviews */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-dark-gray">{review.author}</p>
                  <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center my-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <StarIcon key={star} className="w-5 h-5 text-yellow-400" solid={review.rating >= star} />
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
};

export default Reviews;