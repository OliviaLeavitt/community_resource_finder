import { Phone, Mail, ExternalLink, MapPin, Clock, Users } from 'lucide-react';
import type { ResourceWithDetails } from '../types/resource.ts';

interface ResourceCardProps {
  resource: ResourceWithDetails;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAddress = () => {
    const loc = resource.location;
    if (!loc) return null;

    const parts = [
      loc.address_line1,
      loc.address_line2,
      `${loc.city}, ${loc.state} ${loc.zip_code || ''}`.trim()
    ].filter(Boolean);

    return parts.join(', ');
  };

  const address = getAddress();
  const todayHours = resource.hours.find(h => h.day_of_week === new Date().getDay());

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">{resource.name}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full whitespace-nowrap">
            {resource.category}
          </span>
        </div>

        {resource.organization && (
          <p className="text-sm text-gray-600">
            Provided by <span className="font-medium">{resource.organization.name}</span>
          </p>
        )}
      </div>

      {resource.description && (
        <p className="text-gray-700 leading-relaxed">{resource.description}</p>
      )}

      {address && (
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">{address}</p>
            {resource.distance && (
              <p className="text-xs text-gray-500 mt-1">{resource.distance.toFixed(1)} miles away</p>
            )}
          </div>
        </div>
      )}

      {todayHours && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Today:</span>{' '}
            {todayHours.opens_at && todayHours.closes_at
              ? `${formatTime(todayHours.opens_at)} - ${formatTime(todayHours.closes_at)}`
              : 'Closed'}
            {todayHours.notes && <span className="text-gray-500"> ({todayHours.notes})</span>}
          </p>
        </div>
      )}

      {resource.eligibility.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-2 text-gray-700">
            <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Eligibility:</p>
              {resource.eligibility.map((rule, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  - {rule.description}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {resource.phone && (
          <a
            href={`tel:${resource.phone}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}

        {resource.email && (
          <a
            href={`mailto:${resource.email}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        )}

        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Website
          </a>
        )}

        {address && resource.location?.latitude && resource.location?.longitude && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${resource.location.latitude},${resource.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </a>
        )}
      </div>
    </div>
  );
}

