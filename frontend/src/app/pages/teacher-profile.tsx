import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { Star, Heart, MapPin, Award, Briefcase, GraduationCap, Video, Clock, Users, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/auth-context";
import { avatarInitial, avatarColor } from "@/lib/teacherDisplay";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import api from "@/lib/api";
import type { Teacher, Availability, Review } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function TeacherProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [booking, setBooking] = useState({
    start_at: "",
    end_at: "",
    language_name: "",
    learner_whatsapp_number: "",
    timezone_snapshot: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [startRaw, setStartRaw] = useState("");
  const [endRaw, setEndRaw] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/teachers/${id}/public/`),
      api.get(`/api/teachers/${id}/availability/?timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`),
      api.get(`/api/teachers/${id}/reviews/`),
    ])
      .then(([t, a, r]) => {
        setTeacher(t.data);
        setAvailability(a.data);
        setReviews(r.data);
      })
      .catch(() => toast.error("Could not load teacher profile."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/signin");
      return;
    }
    if (user.role !== "learner") {
      toast.error("Only learners can book lessons.");
      return;
    }
    setBookingLoading(true);
    try {
      const { data: availabilityCheck } = await api.get(`/api/teachers/${id}/availability/check/`, {
        params: { start: booking.start_at, end: booking.end_at },
      });
      if (!availabilityCheck.available) {
        toast.error("This teacher already has a lesson booked during that time. Please pick another slot.");
        return;
      }
      await api.post("/api/bookings/", { teacher: Number(id), ...booking });
      toast.success("Booking request sent! The teacher will confirm shortly.");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Could not send booking request.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (user.role !== "learner") {
      toast.error("Only learners can follow teachers.");
      return;
    }
    try {
      const { data } = await api.post(`/api/teachers/${id}/follow/`, {});
      setTeacher((t) => t && { ...t, is_following: data.following, follower_count: data.follower_count });
    } catch {
      toast.error("Could not update follow status.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }
  if (!teacher) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Teacher not found.</div>;
  }

  const scores = teacher.score_breakdown;
  const certificationList = teacher.certifications.split("\n").map((c) => c.trim()).filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#1A3A35]/10 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              {teacher.profile_photo_url ? (
                <ImageWithFallback
                  src={teacher.profile_photo_url}
                  alt={teacher.full_name}
                  className="w-40 h-40 rounded-full object-cover mb-4"
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-semibold mb-4"
                  style={{ backgroundColor: avatarColor(teacher.full_name) }}
                >
                  {avatarInitial(teacher.full_name)}
                </div>
              )}
              <Button
                variant="outline"
                className={
                  teacher.is_following
                    ? "rounded-full border-[#1A3A35] text-[#1A3A35] bg-[#1A3A35]/5 hover:bg-[#1A3A35]/10"
                    : "rounded-full border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white"
                }
                onClick={handleFollowToggle}
              >
                <Heart className={`w-4 h-4 mr-2 ${teacher.is_following ? "fill-[#1A3A35]" : ""}`} />
                {teacher.is_following ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Right: Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#1A3A35] mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                {teacher.full_name}
              </h1>

              <div className="flex items-center gap-6 mb-4 flex-wrap">
                {teacher.rating !== null && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[#F5C42C] text-[#F5C42C]" />
                    <span className="font-semibold text-lg">{teacher.rating}</span>
                    <span className="text-gray-500">({teacher.review_count} reviews)</span>
                  </div>
                )}
                {teacher.minutes_coached > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{teacher.minutes_coached.toLocaleString()} coaching minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{teacher.follower_count} followers</span>
                </div>
              </div>

              {teacher.country && (
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="w-5 h-5" />
                  <span>{teacher.country}</span>
                </div>
              )}

              {/* Education & Employer Badges */}
              {(teacher.institution || teacher.education.length > 0) && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {teacher.institution && (
                    <Badge className="bg-[#2D5A45]/10 text-[#2D5A45] px-4 py-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {teacher.institution}
                    </Badge>
                  )}
                  {teacher.education.map((edu, idx) => (
                    <Badge key={idx} className="bg-[#E8922A]/10 text-[#7A2E1A] px-4 py-2">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {edu.degree}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Languages */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {teacher.languages.map((lang) => (
                  <Badge key={lang.id} className="bg-[#F5C42C]/20 text-[#7A2E1A] rounded-full px-4 py-2">
                    {lang.language_name}
                  </Badge>
                ))}
              </div>

              {teacher.headline && <h3 className="text-xl font-semibold text-[#1A3A35] mb-2">{teacher.headline}</h3>}

              {teacher.whatsapp_number && (
                <a
                  href={buildWhatsAppLink(
                    teacher.whatsapp_number,
                    `Hi ${teacher.full_name}, I found your profile on Lulimi Connect and would like to ask about lessons.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#2D5A45] hover:underline mt-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Coaching Packages */}
        {(teacher.packages.length > 0 || teacher.price || teacher.pricing_info) && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#1A3A35] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              Coaching Packages
            </h2>
            {teacher.packages.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {teacher.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#1A3A35]/10 p-6"
                  >
                    {pkg.savings && parseFloat(pkg.savings) > 0 && (
                      <Badge className="bg-[#E8922A] text-white mb-3">Save ${pkg.savings}</Badge>
                    )}
                    <h3 className="text-xl font-semibold text-[#1A3A35] mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-[#C4622D]">${pkg.price}</span>
                      <span className="text-sm text-gray-500">{pkg.hours} hours</span>
                    </div>
                    <a href="#book">
                      <Button className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full">
                        Ask about this package
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Hourly Option */}
            {(teacher.price || teacher.pricing_info) && (
              <div className="bg-[#F5F0E8] rounded-2xl p-6 border border-[#1A3A35]/10">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A3A35] mb-2">Custom Hourly Sessions</h3>
                    <p className="text-gray-600">Book individual sessions at your own pace</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#C4622D] mb-2">
                      {teacher.price ? `$${teacher.price}/hr` : teacher.pricing_info}
                    </div>
                    <a href="#book">
                      <Button className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full">Book Session</Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Qualifications Section */}
        {certificationList.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#1A3A35]/10 mb-8">
            <h2 className="text-3xl font-bold text-[#1A3A35] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              Qualifications
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certificationList.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-[#E8922A] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#1A3A35]">{cert}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio Section */}
        {teacher.bio && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#1A3A35]/10 mb-8">
            <h2 className="text-3xl font-bold text-[#1A3A35] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              About {teacher.full_name}
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">{teacher.bio}</div>
          </div>
        )}

        {/* Availability + Booking Section */}
        <div id="book" className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-[#1A3A35]/10">
            <h2 className="text-2xl font-bold text-[#1A3A35] mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
              Availability
            </h2>
            {availability.filter((a) => a.is_active).length > 0 ? (
              <div className="space-y-2">
                {availability
                  .filter((a) => a.is_active)
                  .map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 text-sm">
                      <span className="w-24 font-medium text-gray-700">
                        {DAYS[slot.converted_day_of_week ?? slot.day_of_week]}
                      </span>
                      <span className="text-gray-500">
                        {slot.converted_start_time ?? slot.start_time} – {slot.converted_end_time ?? slot.end_time}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">This teacher hasn't set their availability yet.</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Book a lesson</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.role === "teacher" ? (
                <p className="text-sm text-gray-400">Switch to a learner account to book lessons.</p>
              ) : (
                <form onSubmit={handleBook} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <Input
                      value={booking.language_name}
                      onChange={(e) => setBooking((b) => ({ ...b, language_name: e.target.value }))}
                      placeholder="e.g. Kinyarwanda"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Start time</Label>
                    <Input
                      type="datetime-local"
                      value={startRaw}
                      onChange={(e) => {
                        setStartRaw(e.target.value);
                        setBooking((b) => ({ ...b, start_at: e.target.value ? new Date(e.target.value).toISOString() : "" }));
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>End time</Label>
                    <Input
                      type="datetime-local"
                      value={endRaw}
                      onChange={(e) => {
                        setEndRaw(e.target.value);
                        setBooking((b) => ({ ...b, end_at: e.target.value ? new Date(e.target.value).toISOString() : "" }));
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>
                      Your WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <PhoneNumberInput
                      value={booking.learner_whatsapp_number}
                      onChange={(v) => setBooking((b) => ({ ...b, learner_whatsapp_number: v }))}
                    />
                    <p className="text-xs text-gray-400">Share this if you'd like to move the conversation to WhatsApp.</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Sending…" : user ? "Request lesson" : "Sign in to book"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">The teacher will confirm your request.</p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#1A3A35]/10">
          <h2 className="text-3xl font-bold text-[#1A3A35] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
            Reviews ({teacher.review_count})
          </h2>

          {/* Review Score Breakdown */}
          {scores && (
            <div className="grid md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200">
              {(
                [
                  ["Knowledge", scores.knowledge],
                  ["Value", scores.value],
                  ["Responsiveness", scores.responsiveness],
                  ["Supportiveness", scores.supportiveness],
                ] as [string, number | null][]
              ).map(
                ([label, value]) =>
                  value !== null && (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-[#1A3A35]">{label}</span>
                        <span className="text-sm font-semibold text-[#C4622D]">{value}</span>
                      </div>
                      <Progress value={value * 20} className="h-2" />
                    </div>
                  )
              )}
            </div>
          )}

          {/* Individual Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex gap-4 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: avatarColor(review.learner_name) }}
                    >
                      {avatarInitial(review.learner_name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-[#1A3A35]">{review.learner_name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#F5C42C] text-[#F5C42C]" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#1A3A35]/10 shadow-lg p-4 z-40">
        <div className="container mx-auto flex justify-between items-center flex-wrap gap-3">
          <div>
            <p className="font-semibold text-[#1A3A35]">Ready to start learning?</p>
            <p className="text-sm text-gray-600">Book a lesson with {teacher.full_name}</p>
          </div>
          <a href="#book">
            <Button className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full px-8">
              <Video className="w-4 h-4 mr-2" />
              Book a Lesson
            </Button>
          </a>
        </div>
      </div>

      <div className="mb-24">
        <Footer />
      </div>
    </div>
  );
}
