"use client";

import FeedbackForm from "@/components/feedback/FeedbackForm";

export default function ContactPage() {
  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
          
          {/* Feedback Form */}
          <div className="w-full">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
}
