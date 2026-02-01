"use client";

import {
  useState,
  useEffect,
} from "react";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, Download, AlertCircle, Bot } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  _id: string;
  industry: string;
  location?: string;
  country?: string;
  createdAt: string | number | Date;
  status: "completed" | "running" | "failed";
  total_results?: number;
}

// interface BadgeProps {
//   variant: "outline" | "secondary";
//   className: string;
// }

// interface ButtonProps {
//   variant: "ghost";
//   size: "icon";
//   onClick: () => void;
// }

export default function ScraperPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState(""); // This will now store the country code (e.g., 'us')
  const [countries, setCountries] = useState<{ value: string; name: string }[]>(
    []
  ); // State to hold country list
  const [isStarting, setIsStarting] = useState(false);

  // 1. Fetch Countries on Component Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/country.json");
        if (res.ok) {
          const data = await res.json();
          setCountries(data);
        } else {
          console.error("Failed to load countries");
          toast.error("Could not load country list");
        }
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch Jobs
  const { data: jobs, mutate } = useSWR("/api/scraper/jobs", (url) =>
    fetch(url).then((r) => r.json())
  );

  // Calculate Daily Usage
  const today = new Date().toDateString();
  const todaysLeads =
    jobs
      ?.filter(
        (j: { createdAt: string | number | Date }) =>
          new Date(j.createdAt).toDateString() === today
      )
      .reduce(
        (acc: any, curr: { total_results: any }) =>
          acc + (curr.total_results || 0),
        0
      ) || 0;

  const DAILY_LIMIT = 100;
  const usagePercent = Math.min((todaysLeads / DAILY_LIMIT) * 100, 100);

  const handleScrape = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!searchQuery || (!country && !location)) {
      toast.error(
        "Please enter an industry and choose a country or precise location."
      );
      return;
    }

    if (country && location) {
      toast.error("Choose either a country or a precise location, not both.");
      return;
    }

    if (todaysLeads >= DAILY_LIMIT) {
      toast.error("Daily limit reached. Upgrade plan or wait until tomorrow.");
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Country state now holds the country code (e.g. "us")
        body: JSON.stringify({
          searchQuery,
          country: country || undefined,
          location: location || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("AI Agent deployed! Results will appear shortly.");
      setSearchQuery("");
      // Optional: keep country or reset it
      // setCountry("");
      mutate(); // Refresh list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="text-primary" /> AI Lead Scraper
          </h1>
          <p className="text-muted-foreground mt-1">
            Autonomous agent that visits websites to find emails & data.
          </p>
        </div>

        {/* Usage Card */}
        <Card className="w-64 border-muted">
          <CardContent className="pt-4 pb-4">
            <div className="text-sm font-medium mb-2 flex justify-between">
              <span>Daily Credits</span>
              <span
                className={
                  todaysLeads >= DAILY_LIMIT
                    ? "text-red-500"
                    : "text-muted-foreground"
                }
              >
                {todaysLeads} / {DAILY_LIMIT}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Scraper Form */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent h-full">
            <CardHeader>
              <CardTitle>New Search</CardTitle>
              <CardDescription>Max 80 leads per run.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScrape} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Target Industry
                  </label>
                  <Input
                    placeholder="e.g. Med Spa, HVAC, SaaS"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {/* Precise Location */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Precise Location (optional)
                    </label>
                    <Input
                      placeholder="e.g. New York, Berlin, Ikeja"
                      value={location}
                      disabled={!!country}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    {country && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Clear country to use precise location.
                      </p>
                    )}
                  </div>

                  {/* Country Select */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Target Country
                    </label>

                    <Select
                      value={country}
                      onValueChange={(value) => setCountry(value)}
                      disabled={!!location}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>

                      <SelectContent className="max-h-72">
                        {countries.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Clear location to select a country.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-3 rounded text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>
                    Agent visits every website. This takes about 2-3 minutes per
                    batch.
                  </p>
                </div>

                <Button
                  disabled={
                    isStarting ||
                    !searchQuery ||
                    (!country && !location) ||
                    todaysLeads >= DAILY_LIMIT
                  }
                  className="w-full"
                  type="submit"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying Agent...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Discovery
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Missions</CardTitle>
            </CardHeader>
            <CardContent>
              {!jobs || jobs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No missions run yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
                  {jobs.map((job: Job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-base">
                          {job.industry}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="uppercase">
                            {job?.location || job?.country}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            job.status === "completed" ? "outline" : "secondary"
                          }
                          className={
                            job.status === "completed"
                              ? "bg-green-500/10 text-green-600 border-green-200"
                              : job.status === "failed"
                              ? "bg-red-500/10 text-red-600"
                              : "animate-pulse"
                          }
                        >
                          {job.status === "running"
                            ? "Agent Working..."
                            : job.status}
                        </Badge>

                        {job.status === "completed" && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {job.total_results} Leads
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                (window.location.href = `/dashboard/scraper/${job._id}`)
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
