import { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!jobId) {
      navigate("/jobs");
    }
  }, [jobId, navigate]);

  return (
    <AppLayout>
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center glass-card border-t-[4px] border-t-green-500">
          <CardHeader className="pt-8">
            <div className="mx-auto bg-green-500/10 text-green-500 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading">Payment Successful!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your payment has been processed successfully and the job has been marked as complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="space-y-4">
              <Button asChild className="w-full rounded-xl">
                <Link to={`/jobs/${jobId}`}>
                  Return to Job <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
