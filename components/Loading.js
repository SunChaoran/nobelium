import React from "react";

export default function Loading() {
  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          width: 100%;
          min-height: 100px;
        }

        .spinner::after {
          content: "";
          width: 24px;
          height: 24px;
          border: 4px solid #ddd;
          border-top-color: #555;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
