import type { Experience } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateRange, formatDuration } from '@/candidates/candidate.utils';
import { Briefcase } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Experience
        </h2>
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{exp.title}</h3>
                  <p className="text-sm text-foreground">
                    {exp.company?.displayName || exp.companyName}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>
                    {formatDateRange(
                      exp.startMonth,
                      exp.startYear,
                      exp.endMonth,
                      exp.endYear
                    )}
                  </div>
                  <div className="text-xs">
                    {formatDuration(
                      exp.startMonth,
                      exp.startYear,
                      exp.endMonth,
                      exp.endYear
                    )}
                  </div>
                </div>
              </div>

              {exp.description && (
                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                  {exp.description}
                </p>
              )}

              {exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exp.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
