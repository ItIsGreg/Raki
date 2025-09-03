import { useState } from "react";
import FeedbackDrawer from "./FeedbackDrawer";

/**
 * Example usage of the FeedbackDrawer component with email integration
 */
const FeedbackDrawerExample = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Feedback Drawer Example</h2>
      
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Feedback Drawer
      </button>

      <FeedbackDrawer
        isOpen={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        backendUrl="http://localhost:8000" // Your backend URL
        data-cy="feedback-drawer"
      />
    </div>
  );
};

export default FeedbackDrawerExample;
