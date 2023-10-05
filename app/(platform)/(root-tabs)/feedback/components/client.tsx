'use client';
import FeedbackForm from '@/components/feedback-form';

export const FeedbackClient = () => {
  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="mb-4 text-sm text-center text-primary/50">
        <h1 className="text-4xl font-bold">Feedback</h1>
        <div className="max-w-lg mt-4 text-left">
          <p>
            If you&apos;d like to suggest features and/or improvements you can do so here
            anonymously.
          </p>
        </div>
      </div>
      <div className="w-3/4">
        <FeedbackForm />
      </div>
    </div>
  );
};
