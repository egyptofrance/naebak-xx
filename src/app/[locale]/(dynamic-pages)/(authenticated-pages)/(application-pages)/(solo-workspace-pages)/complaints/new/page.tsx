import type { Metadata } from "next";
import { ComplaintForm } from "./ComplaintForm";

export const metadata: Metadata = {
  title: "Submit New Complaint",
  description: "Submit a new complaint to your representative",
};

export default function NewComplaintPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit a New Complaint</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to submit a complaint to your representative.
        </p>
      </div>
      <ComplaintForm />
    </div>
  );
}

