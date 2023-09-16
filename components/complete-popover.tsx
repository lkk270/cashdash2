import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';

interface CompletePopoverProps {
  keyProp: string;
  title: string;
  content: { title: string; content: string }[];
}

export const CompletePopover = ({ keyProp, title, content }: CompletePopoverProps) => {
  return (
    <Popover>
      <div className="relative">
        <PopoverTrigger asChild>
          <Info
            size={16}
            strokeWidth={3}
            className="absolute text-xs cursor-pointer -top-7 -right-4"
          />
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{title}</h4>
              {/* <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p> */}
            </div>
            <div className="grid gap-2">
              {content.map((value) => {
                return (
                  <div key={keyProp} className="grid items-center grid-cols-3 gap-4">
                    <Label>{value.title}</Label>
                    <p>{value.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};
