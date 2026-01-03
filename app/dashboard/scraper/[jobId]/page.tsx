"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ScrapedLead {
  business_name: string;
  _id: number;
  phone: string;
  website: string;
  email: string;
  city: string;
  notes: string;
  source: string;
}

export default function ScraperResultsPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: results, isLoading } = useSWR(
    `/api/scraper/results/${jobId}`,
    (url) => fetch(url).then((r) => r.json())
  );

  const handleToggleSelect = (id: number) => {
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
        setSelectedIds([]);
        window.location.href = "/dashboard/leads";
      }
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scraper Results</h1>
        <p className="text-muted-foreground">
          {results?.length || 0} businesses found - select which ones to import
        </p>
      </div>

      {results && results.length > 0 && (
        <div className="flex gap-2">
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
        </div>
      )}

      <div className="grid gap-3">
        {results?.map((lead: ScrapedLead) => {
          console.log("lead", lead);
          return (
            <Card key={lead._id} className="hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.includes(lead._id)}
                    onCheckedChange={() => handleToggleSelect(lead._id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {lead.business_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{lead.city}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lead.phone && (
                        <Badge variant="secondary" className="text-xs">
                          {lead.phone}
                        </Badge>
                      )}
                      {lead.email && (
                        <Badge variant="secondary" className="text-xs">
                          {lead.email || "null"}
                        </Badge>
                      )}
                      {lead.website && (
                        <Badge variant="secondary" className="text-[8px] overflow-hidden text-ellipsis max-w-4/5 md:text-xs">
                          <Link
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                          {lead.website}
                          </Link>
                        </Badge>
                      )}
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
