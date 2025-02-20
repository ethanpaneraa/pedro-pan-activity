"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function HistoricalIntroModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenPedroPanIntro");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("hasSeenPedroPanIntro", "true");
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black ${
          isClosing ? "animate-fade-out" : "bg-opacity-50"
        } z-50 transition-opacity duration-500 ease-in-out flex items-center justify-center backdrop-blur-sm`}
      >
        <div
          className={`w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden ${
            isClosing ? "animate-modal-exit" : ""
          }`}
          style={{
            animation: !isClosing ? "modalEnter 0.6s ease-out forwards" : "",
          }}
        >
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X size={24} />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6 border-b pb-2 text-blue-800">
                Operation Pedro Pan: Historical Overview
              </h2>

              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Between 1960 and 1962, over 14,000 unaccompanied Cuban
                  children were sent to the United States in what became known
                  as{" "}
                  <span className="font-semibold text-red-700">
                    Operation Pedro Pan
                  </span>{" "}
                  (Operación Pedro Pan).
                </p>

                <div
                  className="p-4 bg-blue-50 rounded-md border-l-4 border-blue-500 my-4"
                  style={{
                    animation: "fadeIn 1s ease-in 0.4s forwards",
                    opacity: 0,
                  }}
                >
                  <h3 className="font-semibold mb-2">Historical Context:</h3>
                  <p>
                    Following the Cuban Revolution and Fidel Castro&apos;s rise
                    to power in 1959, rumors spread that the new communist
                    government would remove parental authority and send children
                    to Soviet work camps. This led many parents to make the
                    heartbreaking decision to send their children to the United
                    States.
                  </p>
                </div>

                <div
                  className="flex flex-col md:flex-row gap-4 mt-4"
                  style={{
                    animation: "slideUp 0.8s ease-out 0.7s forwards",
                    opacity: 0,
                    transform: "translateY(20px)",
                  }}
                >
                  <div className="flex-1 p-4 bg-red-50 rounded-md">
                    <h3 className="font-semibold mb-2">The Operation:</h3>
                    <p>
                      The Catholic Welfare Bureau (now Catholic Charities) of
                      Miami, led by Father Bryan O. Walsh, collaborated with the
                      U.S. government to create a program granting visa waivers
                      to Cuban children.
                    </p>
                  </div>

                  <div className="flex-1 p-4 bg-yellow-50 rounded-md">
                    <h3 className="font-semibold mb-2">The Children:</h3>
                    <p>
                      Upon arrival, children with family in the U.S. joined
                      relatives. Others were placed in temporary shelters,
                      foster homes, or boarding schools across the country.
                    </p>
                  </div>
                </div>

                <p
                  className="italic text-center mt-6"
                  style={{
                    animation: "fadeIn 1s ease-in 1s forwards",
                    opacity: 0,
                  }}
                >
                  &quot;Operation Pedro Pan was one of the largest exodus of
                  unaccompanied minors in the Western Hemisphere.&qout;
                </p>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={closeModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Begin Experience
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-out {
          animation: fadeOut 0.5s ease-out forwards;
        }

        .animate-modal-exit {
          animation: modalExit 0.6s ease-out forwards;
        }

        @keyframes fadeOut {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes modalExit {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
        }
      `}</style>
    </>
  );
}
