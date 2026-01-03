"use client";

import type React from "react";

import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download } from "lucide-react";

interface ScraperJob {
  _id: number;
  industry: string;
  location: string;
  status: string;
  total_results: number;
  leads_created: number;
  created_at: string;
  completed_at: string | null;
}

export default function ScraperPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: jobs, mutate } = useSWR("/api/scraper/jobs", (url) =>
    fetch(url).then((r) => r.json())
  );

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !location) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery, location }),
      });

      if (res.ok) {
        setSearchQuery("");
        setLocation("");
        mutate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Scraper</h1>
        <p className="text-muted-foreground">
          Find and import business data automatically
        </p>
      </div>

      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>New Scraping Job</CardTitle>
          <CardDescription>
            Search for businesses by industry and location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScrape} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Industry/Type
                </label>
                <Input
                  placeholder="e.g., restaurants, dental clinics, hair salons"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Location
                </label>
                <Input
                  placeholder="e.g., Los Angeles, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <Button
              disabled={isLoading || !searchQuery || !location}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Scraping
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scraping History</CardTitle>
        </CardHeader>
        <CardContent>
          {!jobs || jobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No scraping jobs yet
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job: ScraperJob, index: any) => {
                console.log("job", job);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{job.industry}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          job.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {job.total_results} found
                      </span>
                      {job.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/dashboard/scraper/${job._id}`)
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
