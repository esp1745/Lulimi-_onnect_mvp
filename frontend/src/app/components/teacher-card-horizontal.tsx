import { Link } from "react-router";
import { Star, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { avatarInitial, avatarColor, availabilityStatus } from "@/lib/teacherDisplay";
import type { Teacher } from "@/types";

const availabilityColors: Record<string, string> = {
  today: "bg-[#2D5A45]",
  tomorrow: "bg-[#E8922A]",
  week: "bg-[#E8922A]",
  none: "bg-gray-300",
};

export function TeacherCardHorizontal({ teacher }: { teacher: Teacher }) {
  const { status, label } = availabilityStatus(teacher.availability);
  const profileHref = `/teacher/${teacher.id}`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A3A35]/10 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5">
      <Link
        to={profileHref}
        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-semibold flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: avatarColor(teacher.full_name) }}
      >
        {teacher.profile_photo_url ? (
          <img src={teacher.profile_photo_url} alt={teacher.full_name} className="w-full h-full object-cover" />
        ) : (
          avatarInitial(teacher.full_name)
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <Link to={profileHref} className="font-semibold text-lg text-[#1A3A35] hover:underline">
            {teacher.full_name}
          </Link>
          {teacher.rating !== null && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-[#F5C42C] text-[#F5C42C]" />
              <span className="font-semibold">{teacher.rating}</span>
              <span className="text-gray-400">({teacher.review_count})</span>
            </div>
          )}
          {teacher.minutes_coached > 0 && (
            <span className="text-sm text-gray-500">{teacher.minutes_coached.toLocaleString()} min coached</span>
          )}
          {teacher.badge && (
            <Badge className="bg-[#F5C42C]/20 text-[#7A2E1A] font-semibold">⭐ {teacher.badge}</Badge>
          )}
        </div>

        <h3 className="font-semibold text-[#1A3A35] mb-1">{teacher.headline}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{teacher.bio}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {teacher.country && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {teacher.country}
            </div>
          )}
          {teacher.languages.map((lang) => (
            <Badge key={lang.id} variant="secondary">
              {lang.language_name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start flex-shrink-0 text-right gap-2 sm:gap-0">
        <div className="font-bold text-lg text-[#1A3A35]">
          {teacher.price ? `$${teacher.price}/hr` : teacher.pricing_info || "Contact for pricing"}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 sm:my-2">
          <span className={`w-2 h-2 rounded-full ${availabilityColors[status]}`} />
          {label}
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-36">
          <Link to={profileHref}>
            <Button className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full w-full" size="sm">
              View profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
