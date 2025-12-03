import type { CandidateProfile } from '@/candidates/candidate.types';
import { Card, CardContent } from '@/components/ui/card';
import { formatLocation, formatDateRange } from '@/candidates/candidate.utils';
import { MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ProfileHeaderProps {
  profile: CandidateProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [showFullAbout, setShowFullAbout] = useState(false);
  const aboutText = profile.about || '';
  const isLongAbout = aboutText.length > 300;
  const displayAbout = showFullAbout || !isLongAbout ? aboutText : aboutText.substring(0, 300) + '...';

  const location = formatLocation(profile.locationCity, profile.locationCountry);

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6 space-y-4">
        {/* Headline */}
        {profile.headline && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {profile.headline}
            </h2>
          </div>
        )}

        {/* Current Position */}
        {profile.currentTitle && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">
                {profile.currentTitle}
                {profile.currentCompany && ` at ${profile.currentCompany.displayName}`}
              </p>
              {(profile.currentStartMonth || profile.currentStartYear) && (
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(
                    profile.currentStartMonth,
                    profile.currentStartYear,
                    undefined,
                    undefined
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        )}

        {/* LinkedIn URL */}
        {profile.linkedInUrl && (
          <div>
            <a
              href={profile.linkedInUrl.startsWith('http') ? profile.linkedInUrl : `https://${profile.linkedInUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
            >
              {profile.linkedInUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* About/Summary */}
        {aboutText && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {displayAbout}
            </p>
            {isLongAbout && (
              <button
                onClick={() => setShowFullAbout(!showFullAbout)}
                className="text-sm text-foreground hover:underline mt-2"
              >
                {showFullAbout ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
