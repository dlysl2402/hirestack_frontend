import type { Certification } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { Award, ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (certifications.length === 0) {
    return null;
  }

  const formatCertDate = (month?: number, year?: number): string => {
    if (!year) return '';
    if (!month) return `${year}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month - 1]} ${year}`;
  };

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Certifications
        </h2>
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id}>
              <h3 className="font-semibold text-foreground">{cert.name}</h3>
              <p className="text-sm text-muted-foreground">{cert.organization}</p>

              {(cert.issueMonth || cert.issueYear || cert.expirationMonth || cert.expirationYear) && (
                <p className="text-sm text-muted-foreground">
                  {cert.issueMonth || cert.issueYear ? (
                    <>
                      Issued {formatCertDate(cert.issueMonth, cert.issueYear)}
                      {(cert.expirationMonth || cert.expirationYear) && (
                        <> · Expires {formatCertDate(cert.expirationMonth, cert.expirationYear)}</>
                      )}
                    </>
                  ) : null}
                </p>
              )}

              {cert.credentialId && (
                <p className="text-xs text-muted-foreground">
                  Credential ID: {cert.credentialId}
                </p>
              )}

              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View credential
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
