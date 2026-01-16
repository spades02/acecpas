"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { DealFormData, INITIAL_DATA, STEPS_CONFIG } from '@/types/create-deal';
import { StepBasicInfo } from '@/components/pages/deals/create-deal/step-basic-info';
import { StepDealDetails } from '@/components/pages/deals/create-deal/step-deal-details';
import { StepTimeline } from '@/components/pages/deals/create-deal/step-timeline';
import { StepReview } from '@/components/pages/deals/create-deal/step-review';
import { BackButton } from '@/components/ui/back-button';

export default function CreateDealPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DealFormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof DealFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((c) => c + 1);
    else handleCreateDeal();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
  };

  const handleCreateDeal = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.dealName,
          client_name: formData.clientName,
          deal_type: formData.dealType || 'Quality of Earnings',
          industry: formData.industry,
          deal_size: formData.dealSize,
          target_close_date: formData.targetClose || null,
          description: formData.description,
          status: 'draft'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
      }

      const { deal } = await response.json();

      toast.success('Deal created successfully!');

      // Navigate to the new deal or back to deals list
      setTimeout(() => {
        router.push(`/deals/${deal.id}`);
      }, 500);

    } catch (error) {
      console.error('Create deal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepBasicInfo formData={formData} onChange={handleInputChange} />;
      case 2: return <StepDealDetails formData={formData} onChange={handleInputChange} />;
      case 3: return <StepTimeline formData={formData} onChange={handleInputChange} />;
      case 4: return <StepReview formData={formData} />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <BackButton />
        <h1 className="text-3xl font-bold text-foreground">Create New Deal</h1>
        <p className="text-muted-foreground mt-1">Set up a new Quality of Earnings engagement</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS_CONFIG.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent || isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-muted-foreground'
                  }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>
                <div className="text-sm font-medium mt-2 text-center">{step.title}</div>
              </div>
              {idx < STEPS_CONFIG.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 transition-all ${currentStep > step.number ? 'bg-primary' : 'bg-border'
                  }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {renderStep()}
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS_CONFIG.length}
        </div>

        <Button onClick={handleNext} disabled={isSubmitting}>
          {currentStep === 4 ? (
            <>
              {isSubmitting ? 'Creating...' : <><Check className="w-4 h-4 mr-2" /> Create Deal</>}
            </>
          ) : (
            <>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}