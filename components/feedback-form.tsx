'use client';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  feedback: z.string().min(2, {
    message: 'feedback must be at least 2 characters.',
  }),
});

const FeedbackForm = () => {
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const feedbackText = values.feedback;

    axios
      .post('/api/feedback', {
        feedback: feedbackText,
      })
      .then((response) => {
        console.log(response.data);
        toast({
          description: response.data,
        });
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.data);
        toast({
          description: error.response.data,
          variant: 'destructive',
        });
      });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Feedback</FormLabel> */}
              <FormControl>
                <Textarea
                  className="h-[250px]"
                  placeholder="Don't hold back, we can take it."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default FeedbackForm;
