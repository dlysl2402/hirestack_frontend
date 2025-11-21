import type { Skill } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
  showEndorsements?: boolean;
}

export function SkillsSection({ skills, showEndorsements = false }: SkillsSectionProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill.id} variant="secondary">
              {skill.name}
              {showEndorsements && skill.endorsementCount !== undefined && skill.endorsementCount > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({skill.endorsementCount})
                </span>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
