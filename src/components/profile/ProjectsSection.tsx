import type { Project } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateRange } from '@/candidates/candidate.utils';
import { FolderKanban, ExternalLink } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <FolderKanban className="h-4 w-4" />
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}>
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className="font-semibold text-foreground">{project.name}</h3>
                {(project.startMonth || project.startYear) && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateRange(
                      project.startMonth,
                      project.startYear,
                      project.endMonth,
                      project.endYear
                    )}
                  </span>
                )}
              </div>

              {project.associatedCompany && (
                <p className="text-sm text-muted-foreground">
                  {project.associatedCompany}
                </p>
              )}

              {project.description && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {project.description}
                </p>
              )}

              {project.projectUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.projectUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"
                    >
                      View project
                      <ExternalLink className="h-3 w-3" />
                    </a>
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
