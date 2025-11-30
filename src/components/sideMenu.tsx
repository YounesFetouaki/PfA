"use client";

import React from "react";
import { 
  PlayCircleIcon, 
  SpeechIcon, 
  FileTextIcon, 
  BarChart3Icon, 
  MicIcon,
  BrainIcon 
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="z-[10] bg-slate-100 p-6 w-[200px] fixed top-[64px] left-0 h-full">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col justify-between gap-2">
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.endsWith("/dashboard") ||
              pathname.includes("/interviews")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <PlayCircleIcon className="font-thin	 mr-2" />
            <p className="font-medium ">Interviews</p>
          </div>
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.endsWith("/interviewers")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/interviewers")}
          >
            <SpeechIcon className="font-thin mr-2" />
            <p className="font-medium ">Interviewers</p>
          </div>
          
          {/* Nouvelles fonctionnalités */}
          <div className="border-t border-gray-300 my-2 pt-2">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1 px-3">
              IA Features
            </p>
          </div>
          
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/cv-analysis")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/cv-analysis")}
          >
            <FileTextIcon className="font-thin mr-2" />
            <p className="font-medium ">CV Analysis</p>
          </div>
          
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/recruiter-dashboard")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/recruiter-dashboard")}
          >
            <BarChart3Icon className="font-thin mr-2" />
            <p className="font-medium ">Dashboard</p>
          </div>
          
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/candidates")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/candidates")}
          >
            <FileTextIcon className="font-thin mr-2" />
            <p className="font-medium ">Candidats</p>
          </div>
          
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/voice-interview")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/voice-interview")}
          >
            <MicIcon className="font-thin mr-2" />
            <p className="font-medium ">Voice Interview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
