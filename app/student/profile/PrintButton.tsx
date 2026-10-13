"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 shadow-sm"
    >
      <Printer className="h-4 w-4 mr-1.5" />
      Print Official Passport (PDF)
    </Button>
  );
}
