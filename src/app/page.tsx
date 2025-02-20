"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info, MessageSquare, ThumbsUp, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";
import { HistoricalIntroModal } from "@/components/intro-modal";
import { scenarios } from "@/constants/scenarios";
import { reflectionQuestions } from "@/constants/reflection-questions";
import { outcomes } from "@/constants/outcomes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type CommunityReflection = {
  id: string;
  scenario_id: number;
  decision: string;
  responses: { [key: number]: string };
  created_at: string;
};

export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<
    (typeof scenarios)[0] | null
  >(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [gameState, setGameState] = useState<
    "selection" | "scenario" | "outcome" | "reflection" | "submitted"
  >("selection");
  const [showModal, setShowModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [exitingState, setExitingState] = useState<string | null>(null);
  const [enteringState, setEnteringState] = useState<string | null>(null);
  const [reflectionResponses, setReflectionResponses] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [communityReflections, setCommunityReflections] = useState<
    CommunityReflection[]
  >([]);
  const [oppositeReflections, setOppositeReflections] = useState<
    CommunityReflection[]
  >([]);
  const [isLoadingReflections, setIsLoadingReflections] = useState(false);
  const [likedResponses, setLikedResponses] = useState<{
    [key: string]: boolean;
  }>({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<string>("yours");
  const [communityFilter, setCommunityFilter] = useState<
    "same" | "opposite" | "all"
  >("same");

  useEffect(() => {
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    );
  }, []);

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
    setReflectionResponses({});
  };

  const handleDecision = (choice: "us" | "cuba") => {
    setDecision(choice);
    handleStateTransition("outcome");
  };

  const resetGame = () => {
    handleStateTransition("selection");
    setCurrentScenario(null);
    setDecision(null);
    setReflectionResponses({});
    setFeedbackMessage(null);
    setCommunityReflections([]);
    setOppositeReflections([]);
    setCommunityFilter("same");
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleReflectionChange = (index: number, response: string) => {
    setReflectionResponses((prev) => ({
      ...prev,
      [index]: response,
    }));
  };

  const fetchCommunityReflections = async () => {
    if (!currentScenario) return;

    setIsLoadingReflections(true);

    try {
      const { data: sameDecisionData, error: sameError } = await supabase
        .from("pedro_pan_reflections")
        .select("*")
        .eq("scenario_id", currentScenario.id)
        .eq("decision", decision)
        .neq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (sameError) {
        throw sameError;
      }
      const oppositeDecision = decision === "us" ? "cuba" : "us";
      const { data: oppositeDecisionData, error: oppositeError } =
        await supabase
          .from("pedro_pan_reflections")
          .select("*")
          .eq("scenario_id", currentScenario.id)
          .eq("decision", oppositeDecision)
          .neq("session_id", sessionId)
          .order("created_at", { ascending: false })
          .limit(10);

      if (oppositeError) {
        throw oppositeError;
      }

      setCommunityReflections(sameDecisionData || []);
      setOppositeReflections(oppositeDecisionData || []);
    } catch (error) {
      console.error("Error fetching community reflections:", error);
    } finally {
      setIsLoadingReflections(false);
    }
  };

  const submitReflections = async () => {
    if (!currentScenario || !decision) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const reflectionData = {
        session_id: sessionId,
        scenario_id: currentScenario.id,
        scenario_title: currentScenario.title,
        decision: decision,
        responses: reflectionResponses,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("pedro_pan_reflections")
        .insert([reflectionData]);

      if (error) {
        throw error;
      }

      await fetchCommunityReflections();

      setFeedbackMessage({
        type: "success",
        message:
          "Your reflections have been saved. Thank you for participating!",
      });
      handleStateTransition("submitted");
    } catch (error) {
      console.error("Error submitting reflections:", error);
      setFeedbackMessage({
        type: "error",
        message:
          "There was an error saving your reflections. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeResponse = (reflectionId: string) => {
    setLikedResponses((prev) => ({
      ...prev,
      [reflectionId]: !prev[reflectionId],
    }));
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

  const getFilteredReflections = () => {
    switch (communityFilter) {
      case "same":
        return communityReflections;
      case "opposite":
        return oppositeReflections;
      case "all":
        return [...communityReflections, ...oppositeReflections];
      default:
        return communityReflections;
    }
  };

  const getFilterLabel = () => {
    switch (communityFilter) {
      case "same":
        return `Same Choice (${
          decision === "us" ? "Sent to U.S." : "Kept in Cuba"
        })`;
      case "opposite":
        return `Opposite Choice (${
          decision === "us" ? "Kept in Cuba" : "Sent to U.S."
        })`;
      case "all":
        return "All Responses";
      default:
        return "Filter";
    }
  };

  const allQuestionsAnswered = reflectionQuestions.every(
    (_, index) =>
      reflectionResponses[index] && reflectionResponses[index].trim().length > 0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-100 to-red-100">
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
        <CardContent className="min-h-[400px] flex items-start justify-center overflow-y-auto py-6">
          <div className={`${getContentClasses()} w-full`}>
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
              <div className="space-y-6 w-full">
                <p className="text-lg font-semibold">
                  Reflect on your decision:
                </p>
                <div className="space-y-8">
                  {reflectionQuestions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <Label
                        htmlFor={`reflection-${index}`}
                        className="text-lg"
                      >
                        {question}
                      </Label>
                      <Textarea
                        id={`reflection-${index}`}
                        placeholder="Type your response here..."
                        className="min-h-[100px] transition-all duration-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        value={reflectionResponses[index] || ""}
                        onChange={(e) =>
                          handleReflectionChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                {feedbackMessage && (
                  <div
                    className={`p-3 rounded-md text-center ${
                      feedbackMessage.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {feedbackMessage.message}
                  </div>
                )}
              </div>
            )}
            {gameState === "submitted" && (
              <div className="space-y-6 w-full">
                <Tabs
                  defaultValue="yours"
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mx-auto mb-4">
                    <TabsTrigger value="yours">Your Reflection</TabsTrigger>
                    <TabsTrigger value="community">
                      <div className="flex items-center">
                        <MessageSquare size={16} className="mr-2" />
                        Community Reflections
                        {(communityReflections.length > 0 ||
                          oppositeReflections.length > 0) && (
                          <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 text-xs font-semibold">
                            {communityReflections.length +
                              oppositeReflections.length}
                          </span>
                        )}
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="yours" className="animate-fade-in">
                    <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
                      <p className="text-lg font-semibold">
                        Thank you for sharing your reflections!
                      </p>
                      <p>Your responses have been saved successfully.</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        {currentScenario?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your decision:{" "}
                        <span className="font-medium">
                          {decision === "us" ? "Send to U.S." : "Keep in Cuba"}
                        </span>
                      </p>

                      <div className="space-y-4 mt-6">
                        {reflectionQuestions.map((question, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <p className="font-semibold text-gray-700 mb-2">
                              {question}
                            </p>
                            <p className="text-gray-600">
                              {reflectionResponses[index]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4">Why This Matters</h3>
                    <p className="mb-6">
                      Operation Pedro Pan was a significant historical event
                      that highlights the difficult choices families face during
                      political upheaval. By reflecting on these decisions, we
                      gain empathy for refugees and migrants today.
                    </p>
                  </TabsContent>

                  <TabsContent value="community">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">
                          Community Reflections
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Filter size={14} />
                              <span>{getFilterLabel()}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              View responses from
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setCommunityFilter("same")}
                            >
                              Same choice (
                              {decision === "us"
                                ? "Sent to U.S."
                                : "Kept in Cuba"}
                              )
                              {communityFilter === "same" && (
                                <span className="ml-2">✓</span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCommunityFilter("opposite")}
                            >
                              Opposite choice (
                              {decision === "us"
                                ? "Kept in Cuba"
                                : "Sent to U.S."}
                              )
                              {communityFilter === "opposite" && (
                                <span className="ml-2">✓</span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCommunityFilter("all")}
                            >
                              All responses
                              {communityFilter === "all" && (
                                <span className="ml-2">✓</span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {isLoadingReflections ? (
                        <div className="py-8 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent"></div>
                          <p className="mt-2 text-gray-600">
                            Loading reflections...
                          </p>
                        </div>
                      ) : getFilteredReflections().length === 0 ? (
                        <div className="py-12 text-center bg-gray-50 rounded-lg">
                          <p className="text-lg text-gray-600 mb-2">
                            No{" "}
                            {communityFilter === "same"
                              ? "matching"
                              : communityFilter === "opposite"
                              ? "opposite"
                              : ""}{" "}
                            reflections yet
                          </p>
                          <p className="text-sm text-gray-500">
                            {communityFilter === "same" ||
                            communityFilter === "all"
                              ? "You're one of the first to make this choice! Check back later to see how others responded."
                              : "No one has made the opposite choice yet! Check back later to see different perspectives."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8 mt-4">
                          {getFilteredReflections().map((reflection) => (
                            <div
                              key={reflection.id}
                              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                            >
                              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-500">
                                    {formatDate(reflection.created_at)}
                                  </div>
                                  {(communityFilter === "all" ||
                                    (communityFilter === "opposite" &&
                                      reflection.decision !== decision)) && (
                                    <Badge
                                      variant={
                                        reflection.decision === "us"
                                          ? "default"
                                          : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {reflection.decision === "us"
                                        ? "Sent to U.S."
                                        : "Kept in Cuba"}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleLikeResponse(reflection.id)
                                  }
                                  className={`flex items-center gap-1 text-xs ${
                                    likedResponses[reflection.id]
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <ThumbsUp size={14} />
                                  {likedResponses[reflection.id]
                                    ? "Liked"
                                    : "Like"}
                                </Button>
                              </div>
                              <div className="p-4 space-y-4">
                                {reflectionQuestions.map((question, index) => (
                                  <div key={index} className="mb-4 last:mb-0">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                      {question}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {reflection.responses[index] ||
                                        "[No response]"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button
                onClick={submitReflections}
                className="transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700"
                disabled={!allQuestionsAnswered || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Reflections"}
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                className="transition-transform duration-200 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          )}
          {gameState === "submitted" && (
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

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-content-exit {
          animation: contentExit 0.4s ease-out forwards;
        }

        .animate-content-enter {
          animation: contentEnter 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
