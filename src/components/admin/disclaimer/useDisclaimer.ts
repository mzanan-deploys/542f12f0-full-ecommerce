import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { getSetting, updateSetting } from '@/lib/actions/settingsActions';
import { disclaimerFormSchema, type DisclaimerFormData } from '@/lib/schemas/disclaimerSchema';

const DISCLAIMER_KEY = 'disclaimer_text';

export function useDisclaimer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DisclaimerFormData>({
    resolver: zodResolver(disclaimerFormSchema),
    defaultValues: {
      disclaimerText: '',
    },
  });

  useEffect(() => {
    async function fetchDisclaimer() {
      setIsLoading(true);
      const result = await getSetting(DISCLAIMER_KEY);
      if (result.success && result.data?.value) {
        form.reset({ disclaimerText: result.data.value });
      } else if (!result.success && result.error !== 'Setting not found') {
        toast.error(`Failed to load disclaimer: ${result.error}`);
      }
      setIsLoading(false);
    }
    fetchDisclaimer();
  }, [form]);

  const onSubmit = (values: DisclaimerFormData) => {
    startTransition(async () => {
      const result = await updateSetting(DISCLAIMER_KEY, values.disclaimerText);
      if (result.success) {
        toast.success("Disclaimer updated successfully.");
      } else {
        toast.error(`Failed to update disclaimer: ${result.error}`);
      }
    });
  };

  return {
    form,
    isLoading,
    isPending,
    onSubmit
  };
} 