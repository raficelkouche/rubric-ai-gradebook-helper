
import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../Logo';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-rubric-cream">
      <div className="w-full md:w-1/2 bg-rubric-navy flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md w-full">
          <Logo className="mb-8 justify-center md:justify-start" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to RubricAI</h1>
          <p className="text-lg mb-6">
            The AI-powered grading system that helps teachers save time and provide consistent feedback.
          </p>
          <div className="bg-rubric-navy-light p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Why teachers love RubricAI</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-rubric-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Grade exams 10x faster with AI</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-rubric-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Improve consistency across all grading</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-rubric-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gain insights with detailed analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
