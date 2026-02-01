"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  Globe,
  Facebook,
  Linkedin,
  Instagram,
  Edit,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Updated Interface to match AI Scraper Output
interface ScrapedLead {
  _id: string;
  name: string; // Changed from business_name
  phone: string;
  website: string;
  email: string;
  secondary_emails?: string[];
  location: string; // Changed from city
  description?: string;
  ai_confidence_score: number;
  social?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  stats?: {
    years_in_business?: string;
    team_size?: string;
  };
}

export default function ScraperResultsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: results, isLoading } = useSWR(
    `/api/scraper/results/${jobId}`, // Ensure this route exists and returns ScrapedLead[]
    (url) => fetch(url).then((r) => r.json())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch(`/api/scraper/results/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds }),
      });

      if (res.ok) {
        toast.success(`Successfully imported ${selectedIds.length} leads!`);
        setSelectedIds([]);
        // Optional: Redirect to CRM
        // window.location.href = "/dashboard/leads";
      } else {
        toast.error("Failed to import leads");
      }
    } catch (e) {
      toast.error("Error importing leads");
    } finally {
      setIsImporting(false);
    }
  };

  const updateLead = async (
    leadId: string,
    payload: { email?: string; website?: string }
  ) => {
    try {
      const res = await fetch(`/api/scraper/results/${jobId}/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Lead updated");
    } catch {
      toast.error("Failed to update lead");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading deep-search results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Mission Results
          </h1>
          <p className="text-muted-foreground">
            {results?.length || 0} businesses analyzed by AI Agent.
          </p>
        </div>

        {results && results.length > 0 && (
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() =>
                setSelectedIds(
                  selectedIds.length === results.length
                    ? []
                    : results.map((r: ScrapedLead) => r._id)
                )
              }
            >
              {selectedIds.length === results.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <Button
              disabled={selectedIds.length === 0 || isImporting}
              onClick={handleImport}
              className="bg-primary hover:bg-primary/90"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {selectedIds.length} Leads
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              disabled={selectedIds.length === 0 || revalidating}
              onClick={async () => {
                try {
                  await fetch(`/api/scraper/results/${jobId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ selectedIds, revalidate: true }),
                  });
                  toast.success("Revalidation complete");
                } catch (e) {
                  toast.error("Error revalidating Leads");
                } finally {
                  setRevalidating(false);
                }
              }}
            >
              Revalidate Leads
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {results?.map((lead: ScrapedLead) => {
          const isHighConfidence = (lead.ai_confidence_score || 0) > 80;

          return (
            <Card
              key={lead._id}
              className={`transition-all duration-200 border-l-4 ${
                selectedIds.includes(lead._id)
                  ? "border-l-primary ring-1 ring-primary/20 bg-primary/5"
                  : isHighConfidence
                  ? "border-l-green-500 hover:border-l-green-600"
                  : "border-l-muted hover:border-l-primary/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.includes(lead._id)}
                    onCheckedChange={() => handleToggleSelect(lead._id)}
                    className="mt-1.5"
                  />

                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Main Info */}
                    <div className="md:col-span-5 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold text-lg truncate"
                          title={lead.name}
                        >
                          {lead.name}
                        </h3>
                        {isHighConfidence && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-200 text-[10px] px-1 py-0 h-5"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {lead.location}
                      </p>

                      {lead.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                          "{lead.description}"
                        </p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-4 space-y-2">
                      {lead.email ? (
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="secondary"
                            className="w-fit text-xs font-mono"
                          >
                            {lead.email}
                          </Badge>
                          {lead.secondary_emails?.slice(0, 1).map((em) => (
                            <span
                              key={em}
                              className="text-xs text-muted-foreground pl-1"
                            >
                              {em}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const email = prompt("Enter verified email");
                            if (email) updateLead(lead._id, { email });
                            
                          }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground italic hover:text-primary transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Add email</span>
                        </button>
                      )}

                      {lead.phone && (
                        <div className="text-xs text-muted-foreground">
                          📞 {lead.phone}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Stats */}
                    <div className="md:col-span-3 flex flex-col gap-2 items-end justify-between h-full">
                      <div className="flex gap-2">
                        {lead.website ? (
                          <Link
                            href={lead.website}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Globe className="w-4 h-4" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const website = prompt("Enter valid website");
                              if (website) updateLead(lead._id, { website });
                            }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground italic hover:text-primary transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Add website</span>
                          </button>
                        )}
                        {lead.social?.linkedin && (
                          <Link
                            href={lead.social.linkedin}
                            target="_blank"
                            className="text-muted-foreground hover:text-blue-600"
                          >
                            <Linkedin className="w-4 h-4" />
                          </Link>
                        )}
                        {lead.social?.facebook && (
                          <Link
                            href={lead.social.facebook}
                            target="_blank"
                            className="text-muted-foreground hover:text-blue-500"
                          >
                            <Facebook className="w-4 h-4" />
                          </Link>
                        )}
                        {lead.social?.instagram && (
                          <Link
                            href={lead.social.instagram}
                            target="_blank"
                            className="text-muted-foreground hover:text-pink-600"
                          >
                            <Instagram className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {lead.stats && Object.keys(lead.stats).length > 0 && (
                        <div className="text-[10px] text-right text-muted-foreground bg-muted/50 p-1.5 rounded">
                          {lead.stats.team_size && (
                            <div>Team: {lead.stats.team_size}</div>
                          )}
                          {lead.stats.years_in_business && (
                            <div>Age: {lead.stats.years_in_business}</div>
                          )}
                        </div>
                      )}

                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          lead.ai_confidence_score > 70
                            ? "text-green-600 border-green-200"
                            : "text-amber-600 border-amber-200"
                        }`}
                      >
                        {lead.ai_confidence_score}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
