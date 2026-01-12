"use client"
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import our pieces
import { DealFormData, INITIAL_DATA, STEPS_CONFIG } from '@/types/create-deal'; // (Assuming you move types to a file, or keep them top of file)
import { StepBasicInfo } from '@/components/pages/deals/create-deal/step-basic-info';
import { StepDealDetails } from '@/components/pages/deals/create-deal/step-deal-details';
import { StepTimeline } from '@/components/pages/deals/create-deal/step-timeline';
import { StepReview } from '@/components/pages/deals/create-deal/step-review';
import { BackButton } from '@/components/ui/back-button';

interface CreateDealPageProps {
  onNavigate: (page: string) => void;
}

export default function CreateDealPage({ onNavigate }: CreateDealPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DealFormData>(INITIAL_DATA);

  // --- Logic ---
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

  const handleCreateDeal = () => {
    toast.success('Deal created successfully!');
    setTimeout(() => onNavigate('upload'), 500);
  };

  // --- Dynamic Step Rendering ---
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

      {/* Progress Stepper (Extracted logic for readability) */}
      <div className="flex items-center justify-between mb-8">
        {STEPS_CONFIG.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent || isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>
                <div className="text-sm font-medium mt-2 text-center">{step.title}</div>
              </div>
              {idx < STEPS_CONFIG.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 transition-all ${
                  currentStep > step.number ? 'bg-primary' : 'bg-border'
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
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS_CONFIG.length}
        </div>

        <Button onClick={handleNext}>
          {currentStep === 4 ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Create Deal
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