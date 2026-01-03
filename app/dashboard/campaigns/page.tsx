"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Loader, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface Campaign {
  _id: number;
  name: string;
  subject: string;
  status: string;
  total_recipients: number;
  created_at: string;
}

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  cold_outreach: {
    subject: "Quick question about {{business_name}}",
    body: `Hi, Good day,

I came across {{business_name}} while looking at restaurants in {{city}}.

I noticed your website is still using an older layout, and it may not be taking full advantage of modern features like online ordering, reservations, and repeat-customer tools.

Many restaurants are upgrading to modern websites that:
• Let customers order directly (no UberEats fees)
• Handle reservations without OpenTable
• Work perfectly on mobile
• Capture customer data for repeat visits

I put together a modern restaurant website template you can preview here:
{{demo_link}}

Would you be open to a quick look to see if this makes sense for {{business_name}}?

Best regards,  
{{your_name}}  
{{social_link}}`,
  },

  followup: {
    subject: "Following up — {{business_name}}",
    body: `Hi, Good day,

Just following up on my last message.

The reason I reached out is that many restaurants are moving away from:
• Third-party ordering platforms
• Separate tools for reservations
• Outdated websites that don’t convert visitors into customers

With a modern website, restaurants can:
✓ Take orders directly
✓ Manage reservations in one place
✓ Send promos during slow hours
✓ Own their customer data

Here’s the example again:
{{demo_link}}

Would you like me to show you how this could work specifically for {{business_name}}?

Best,  
{{your_name}}  
{{social_link}}`,
  },

  partnership: {
    subject: "A better way for {{business_name}} to handle orders",
    body: `Hi, Good day,

I’m reaching out because many restaurants in {{city}} are realizing they don’t actually own their online presence.

Between UberEats, DoorDash, OpenTable, and delivery platforms:
• Fees add up quickly
• Customer data isn’t yours
• You’re locked into third-party systems

I help restaurants move to a modern setup where they:
✓ Own their website and technology
✓ Take direct food orders
✓ Manage reservations internally
✓ Optionally add delivery tracking & rider dispatch
✓ Can later expand into a mobile app if they want

Here’s a live example of the modern setup:
{{demo_link}}

If this sounds useful, I’d be happy to walk you through it briefly.

{{cta_message}}

Best regards,  
{{your_name}}  
{{social_link}}`,
  },

  evolution: {
    subject: "The way customers order food has changed",
    body: `Hi, Good day,

The way customers discover and order food has changed a lot in the last few years.

Today, customers expect:
• Fast mobile websites
• Direct ordering without redirection
• Loyalty rewards
• Easy reservations
• Order tracking

Most older restaurant websites weren’t built for this.

That’s why many restaurants are upgrading to modern websites that replace:
• UberEats-style fees
• OpenTable subscriptions
• Multiple disconnected tools

I built a modern restaurant website template that shows what the “new standard” looks like:
{{demo_link}}

If you’d like, I can also show how this can later extend into a mobile app — all under your brand.

Worth a quick look?

— {{your_name}}  
{{social_link}}`,
  },

  breakup: {
    subject: "Should I close this?",
    body: `Hi, Good day,

I haven’t heard back, so I’ll assume now might not be the right time.

Before I close this out, I just wanted to offer one last thing:
I can show you a free preview of what a modern website (and optional app) for {{business_name}} could look like — no commitment.

If you want me to send it, just reply “Yes”.
If not, no worries at all.

Thanks for your time,  
{{your_name}}  
{{social_link}}`,
  },
};

export default function CampaignsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!name || !subject || !body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body }),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast({ title: "Success", description: "Campaign created" });
      setName("");
      setSubject("");
      setBody("");
      setShowComposer(false);
      await fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: "Campaign deleted" });
        await fetchCampaigns();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900";
    }
  };

  const applyTemplate = (template: string) => {
    const templates = TEMPLATES;
    if (templates[template]) {
      setSubject(templates[template].subject);
      setBody(templates[template].body);
    }
  };

  const RenderTemplates = () => {
    return (
      <div className="flex gap-2 flex-wrap">
        {Object.keys(TEMPLATES).map((t) => (
          <Button
            key={t}
            variant={selectedTemplate === t ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedTemplate(t);
              applyTemplate(t);
            }}
          >
            {t.replace(/_/g, " ").toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns
          </p>
        </div>
        <Button
          onClick={() => setShowComposer(!showComposer)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {showComposer && (
        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Compose Campaign</CardTitle>
            <CardDescription>
              Create a new email campaign with variables and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g., Restaurant Outreach Wave 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Template (Optional)</Label>
              <RenderTemplates />
            </div>

            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                placeholder="Use variables like {{business_name}}, {{city}}, {{name}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available variables:{" "}
                {`{{business_name}}, {{city}}, {{name}}, {{phone}}, {{website}}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                placeholder="Write your email message. Use variables like {{business_name}} to personalize."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-48 font-mono text-sm"
              />
            </div>

            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Preview (Sample Data)</p>
              <div className="text-sm space-y-1 bg-background/50 p-3 rounded border border-border/50">
                <p className="font-bold text-xs">Subject:</p>
                <p className="text-xs mb-2">
                  {subject
                    .replace(/\{\{business_name\}\}/g, "Burger King")
                    .replace(/\{\{city\}\}/g, "New York")
                    .replace(/\{\{name\}\}/g, "John")
                    .replace(/\{\{social_link\}\}/g, `View my work & socials`)
                    .replace(/\{\{your_name\}\}/g, "Myles Kamsy Xavier (MKX)")
                    .replace(/\{\{demo_link\}\}/g, "Restaurant Website Demo")}
                </p>
                <p className="font-bold text-xs">Body Preview:</p>
                <p className="text-xs whitespace-pre-wrap">
                  {body
                    .replace(/\{\{business_name\}\}/g, "Burger King")
                    .replace(/\{\{city\}\}/g, "New York")
                    .replace(/\{\{name\}\}/g, "John")
                    .replace(/\{\{social_link\}\}/g, `View my work & socials`)
                    .replace(/\{\{your_name\}\}/g, "Myles Kamsy Xavier (MKX)")
                    .replace(/\{\{demo_link\}\}/g, "Restaurant Website Demo")}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateCampaign}
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Campaigns ({campaigns.length})</CardTitle>
          <CardDescription>All email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No campaigns yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      onClick={() =>
                        router.push(`/dashboard/campaigns/${campaign?._id}`)
                      }
                      key={campaign._id}
                      className="border-border/50 hover:bg-muted/30 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {campaign.subject}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.total_recipients}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {campaign.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-transparent"
                          >
                            <Send className="w-4 h-4" />
                            Send
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
