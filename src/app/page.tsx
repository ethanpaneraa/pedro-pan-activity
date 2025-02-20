"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoricalIntroModal } from "@/components/intro-modal";

const scenarios = [
  {
    id: 1,
    title: "The Young Child",
    description:
      "Your child is 6 years old. Rumors are spreading that your parental rights will be taken away, and your child will be placed in communist indoctrination centers. You have one tia in Miami, but no immediate family there. You are a working-class family.",
    question:
      "Do you send your chfild to the United States or keep them in Cuba?",
  },
  {
    id: 2,
    title: "The Teenager",
    description:
      "Your child is 14 years old. All your family is in Cuba. The militia has closed catholic and private schools, and you can no longer attend school. You are a middle-class family.",
    question:
      "Do you send your child to the United States or keep them in Cuba?",
  },
  {
    id: 3,
    title: "The Child of Activists",
    description:
      "Your child is 8 years old. Your parents are actively fighting against Castro and his regime. If you choose to send your child to the United States, they can only take one 40-pound bag. You are a middle-class family. You have some family in Miami.",
    question:
      "Do you send your child to the United States or keep them in Cuba?",
  },
  {
    id: 4,
    title: "The Older Teen",
    description:
      "Your child is 16 years old. Your parents heard about priests, brothers, and bishops being rounded up by the Castro regime at gunpoint on September 1961. They were sent out of Cuba in a Spanish ship called Covadonga. Priests who remained were sent to forced labor camps. You're a working-class family. You have no family in Miami. Your family has never been involved in political matters, but tensions are rising.",
    question:
      "Do you send your child to the United States or keep them in Cuba?",
  },
];

const outcomes = {
  us: "Your child was part of Operation Pedro Pan, which brought 14,000 Cuban children to the U.S. between 1960-1962. They were placed in the Cuban Children's Program (CCP), run by the Catholic Welfare Bureau. If they had no family in Miami, they were placed in orphanages or foster homes. Some children never reunite with their parents. The Church enforced strict rules, ensuring children learned English and adapted to American culture. Many Pedro Pan children struggled with loss, loneliness, and cultural identity, but some adapted and built successful lives in the U.S.",
  cuba: "The U.S. embargo of the 1960s caused severe economic hardship. Your family struggled with food shortages and poverty. Your child was required to join the Union of Cuban Pioneers, later renamed the José Martí Pioneers Organization (OPJM). They were indoctrinated with communist ideology in school, learning slogans like: 'To die for the fatherland is to live.' Some families who stayed in Cuba faced government surveillance, limiting their ability to leave later. Others adapted, staying in Cuba and supporting the revolution.",
};

const reflectionQuestions = [
  "How did you decide what to do?",
  "What were the biggest factors that influenced your choice?",
  "Do you think your decision would have changed if you were really living in 1961 Cuba? Why or why not?",
  "How do you think the experiences of Operation Pedro Pan compare to modern migration crises?",
];

export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<
    (typeof scenarios)[0] | null
  >(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [gameState, setGameState] = useState<
    "selection" | "scenario" | "outcome" | "reflection"
  >("selection");
  const [showModal, setShowModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exitingState, setExitingState] = useState<string | null>(null);
  const [enteringState, setEnteringState] = useState<string | null>(null);

  const handleStateTransition = (
    newState: typeof gameState,
    scenario: (typeof scenarios)[0] | null = null
  ) => {
    setIsTransitioning(true);
    setExitingState(gameState);
    setEnteringState(newState);

    setTimeout(() => {
      if (scenario) {
        setCurrentScenario(scenario);
      }
      setGameState(newState);
      setTimeout(() => {
        setIsTransitioning(false);
        setExitingState(null);
        setEnteringState(null);
      }, 500);
    }, 400);
  };

  const handleScenarioSelect = (scenario: (typeof scenarios)[0]) => {
    handleStateTransition("scenario", scenario);
  };

  const handleDecision = (choice: "us" | "cuba") => {
    setDecision(choice);
    handleStateTransition("outcome");
  };

  const resetGame = () => {
    handleStateTransition("selection");
    setCurrentScenario(null);
    setDecision(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const getContentClasses = () => {
    const baseClasses = "transition-all duration-400 ease-in-out";

    if (isTransitioning) {
      if (exitingState === gameState) {
        return `${baseClasses} animate-content-exit`;
      } else if (enteringState === gameState) {
        return `${baseClasses} animate-content-enter`;
      }
    }

    return baseClasses;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-100 to-red-100">
      {/* Include the historical intro modal */}
      <HistoricalIntroModal forceShow={showModal} onClose={handleModalClose} />

      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="relative pb-2">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full"
              title="Historical Context"
            >
              <Info size={24} />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Cuban Exodus: 1961
          </CardTitle>
          <CardDescription className="text-center">
            Experience the difficult decisions faced by Cuban parents during the
            early 1960s.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className={getContentClasses()}>
            {gameState === "selection" && (
              <div className="space-y-4 w-full">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Choose a scenario:</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <Button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario)}
                      className="h-auto py-4 text-left transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <div>
                        <p className="font-semibold">{scenario.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {scenario.description.split(".")[0]}.
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {gameState === "scenario" && currentScenario && (
              <div className="space-y-4 w-full">
                <p className="text-lg font-semibold">{currentScenario.title}</p>
                <p className="text-lg">{currentScenario.description}</p>
                <p className="text-lg font-semibold">
                  {currentScenario.question}
                </p>
              </div>
            )}
            {gameState === "outcome" && decision && (
              <div className="space-y-4 w-full">
                <p className="text-lg font-semibold">Outcome:</p>
                <p className="text-lg">
                  {outcomes[decision as keyof typeof outcomes]}
                </p>
              </div>
            )}
            {gameState === "reflection" && (
              <div className="space-y-4 w-full">
                <p className="text-lg font-semibold">
                  Reflect on your decision:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  {reflectionQuestions.map((question, index) => (
                    <li key={index} className="text-lg">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          {gameState === "scenario" && (
            <>
              <Button
                onClick={() => handleDecision("us")}
                className="transition-transform duration-200 hover:scale-105"
              >
                Send to U.S.
              </Button>
              <Button
                onClick={() => handleDecision("cuba")}
                className="transition-transform duration-200 hover:scale-105"
              >
                Keep in Cuba
              </Button>
            </>
          )}
          {gameState === "outcome" && (
            <Button
              onClick={() => handleStateTransition("reflection")}
              className="transition-transform duration-200 hover:scale-105"
            >
              Reflect
            </Button>
          )}
          {gameState === "reflection" && (
            <Button
              onClick={resetGame}
              className="transition-transform duration-200 hover:scale-105"
            >
              Choose New Scenario
            </Button>
          )}
        </CardFooter>
      </Card>

      <style jsx global>{`
        @keyframes contentExit {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        @keyframes contentEnter {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-content-exit {
          animation: contentExit 0.4s ease-out forwards;
        }

        .animate-content-enter {
          animation: contentEnter 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
