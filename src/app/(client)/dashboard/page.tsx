"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { Gem, Plus } from "lucide-react";
import Image from "next/image";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") setIsModalOpen(true);
          }
          if (data?.allowed_responses_count)
            setAllowedResponsesCount(data.allowed_responses_count);
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };
    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") return;
      setLoading(true);
      try {
        const totalResponses = await ResponseService.getResponseCountByOrganizationId(
          organization.id
        );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md w-full">
      <div className="flex flex-col w-full">
        <h2 className="text-3xl font-bold tracking-tight mt-8 text-gray-900">
          Tableau de bord
        </h2>
        <h3 className="text-sm tracking-tight text-gray-600 font-medium mb-8">
          Accédez rapidement aux fonctionnalités principales
        </h3>

        {/* ✅ Full-width navigation cards */}
        <div className="flex flex-col gap-6 w-full">
          
          <Link href="/dashboard/cv-analysis?jobId=xxx&jobDescription=Senior%20Developer" className="w-full">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer">
              <CardContent className="flex flex-col md:flex-row justify-between items-center p-8">
                <div>
                  <CardTitle className="text-2xl font-semibold mb-2">
                    📄 Analyser un CV
                  </CardTitle>
                  <p className="text-gray-600">
                    Soumettez un CV et recevez une analyse intelligente avec
                    des suggestions adaptées à l'offre d'emploi.
                  </p>
                </div>
                <Button className="mt-4 md:mt-0">Accéder</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/recruiter-dashboard?jobId=xxx" className="w-full">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer">
              <CardContent className="flex flex-col md:flex-row justify-between items-center p-8">
                <div>
                  <CardTitle className="text-2xl font-semibold mb-2">
                    👤 Dashboard Recruteur
                  </CardTitle>
                  <p className="text-gray-600">
                    Gérez vos offres, candidats, et suivez les performances de
                    vos entretiens en un seul endroit.
                  </p>
                </div>
                <Button className="mt-4 md:mt-0" variant="secondary">
                  Ouvrir
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Existing Interviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Mes Interviews
          </h2>
          <h3 className="text-sm tracking-tight text-gray-600 font-medium">
            Commencez à recevoir des réponses dès maintenant !
          </h3>

          <div className="relative flex items-center mt-4 flex-wrap">
            {currentPlan == "free_trial_over" ? (
              <Card className="flex bg-gray-200 items-center border-dashed border-gray-700 border-2 hover:scale-105 ease-in-out duration-300 h-60 w-56 ml-1 mr-3 mt-4 rounded-xl shrink-0 overflow-hidden shadow-md">
                <CardContent className="flex items-center flex-col mx-auto">
                  <Plus size={90} strokeWidth={0.5} className="text-gray-700" />
                  <CardTitle className="p-0 text-md text-center mt-2">
                    You cannot create any more interviews unless you upgrade
                  </CardTitle>
                </CardContent>
              </Card>
            ) : (
              <CreateInterviewCard />
            )}

            {interviewsLoading || loading ? (
              <div className="flex flex-row">
                <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
                <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
                <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
              </div>
            ) : (
              <>
                {isModalOpen && (
                  <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {/* Existing Modal Content */}
                  </Modal>
                )}
                {interviews.map((item) => (
                  <InterviewCard
                    key={item.id}
                    id={item.id}
                    interviewerId={item.interviewer_id}
                    name={item.name}
                    url={item.url ?? ""}
                    readableSlug={item.readable_slug}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Interviews;
