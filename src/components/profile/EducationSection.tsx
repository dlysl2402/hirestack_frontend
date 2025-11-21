import type { Education } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  educations: Education[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  if (educations.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Education
        </h2>
        <div className="space-y-4">
          {educations.map((edu) => (
            <div key={edu.id}>
              <h3 className="font-semibold text-foreground">{edu.school}</h3>
              {edu.degree && (
                <p className="text-sm text-muted-foreground">{edu.degree}</p>
              )}
              {(edu.startYear || edu.endYear) && (
                <p className="text-sm text-muted-foreground">
                  {edu.startYear && edu.endYear
                    ? `${edu.startYear} - ${edu.endYear}`
                    : edu.startYear || edu.endYear}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
