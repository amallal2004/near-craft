import { useSearchParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  return (
    <AppLayout>
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center glass-card border-t-[4px] border-t-destructive">
          <CardHeader className="pt-8">
            <div className="mx-auto bg-destructive/10 text-destructive w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading">Payment Cancelled</CardTitle>
            <CardDescription className="text-base mt-2">
              Your payment process was cancelled or interrupted. No charges were made.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to={jobId ? `/jobs/${jobId}` : "/jobs"}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
