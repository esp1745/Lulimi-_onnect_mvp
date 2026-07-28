import { useState, useEffect } from "react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Search } from "lucide-react";
import { TeacherCardHorizontal } from "../components/teacher-card-horizontal";
import api from "@/lib/api";
import type { Teacher } from "@/types";

const regions = ["West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"];
const specializations = ["Conversational", "Business Language", "Cultural Immersion", "Grammar Focus", "Children's Education"];
const services = ["1-on-1 Lessons", "Group Classes", "Business Language", "Cultural Workshops", "Translation Services"];

type SortBy = "popular" | "topRated" | "budget" | "new" | "mostExperience";

export function TeacherListing() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("popular");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (priceRange[0] !== 0) params.set("min_price", String(priceRange[0]));
      if (priceRange[1] !== 100) params.set("max_price", String(priceRange[1]));
      selectedRegions.forEach((r) => params.append("region", r));
      selectedSpecializations.forEach((s) => params.append("specializations", s));
      selectedServices.forEach((s) => params.append("services", s));
      params.set("ordering", sortBy);
      setLoading(true);
      api
        .get(`/api/teachers/marketplace/?${params}`)
        .then(({ data }) => setTeachers(data))
        .catch(() => setTeachers([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery, priceRange, selectedRegions, selectedSpecializations, selectedServices, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 100]);
    setSelectedRegions([]);
    setSelectedSpecializations([]);
    setSelectedServices([]);
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Left Sidebar Filters */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A3A35]/10 sticky top-24">
              <h3 className="font-semibold text-lg text-[#1A3A35] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Filters
              </h3>

              {/* Hourly Rate */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-[#1A3A35]">Hourly Rate</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100}
                  step={5}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Region */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-[#1A3A35]">Region</h4>
                <div className="space-y-3">
                  {regions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRegions([...selectedRegions, region]);
                          } else {
                            setSelectedRegions(selectedRegions.filter((r) => r !== region));
                          }
                        }}
                      />
                      <label
                        htmlFor={region}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-[#1A3A35]">Specialization</h4>
                <div className="space-y-3">
                  {specializations.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={spec}
                        checked={selectedSpecializations.includes(spec)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSpecializations([...selectedSpecializations, spec]);
                          } else {
                            setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
                          }
                        }}
                      />
                      <label
                        htmlFor={spec}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Offered */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-[#1A3A35]">Services Offered</h4>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter((s) => s !== service));
                          }
                        }}
                      />
                      <label
                        htmlFor={service}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Right: Teacher List */}
          <div className="flex-1">
            {/* Page Header */}
            <div className="mb-8">
              <div className="text-xs uppercase tracking-wide text-[#C4622D] font-semibold mb-2">
                FIND YOUR TEACHER
              </div>
              <h1 className="text-4xl font-bold text-[#1A3A35] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                All African Language Educators
              </h1>
              <p className="text-gray-600 text-base mb-6">
                Book one-on-one time with an expert teacher to make progress on your goals.
              </p>

              {/* Search Bar */}
              <form
                className="flex gap-3 mb-8"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by language, name, country..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
                  />
                </div>
                <Button type="submit" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white px-8 rounded-xl">
                  Search
                </Button>
              </form>

              {/* Tabs and Sort */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  {(
                    [
                      { key: "popular", label: "Popular" },
                      { key: "topRated", label: "Top Rated" },
                      { key: "budget", label: "Budget-Friendly" },
                      { key: "new", label: "New" },
                    ] as { key: SortBy; label: string }[]
                  ).map((tab) => (
                    <Button
                      key={tab.key}
                      variant="ghost"
                      onClick={() => setSortBy(tab.key)}
                      className={
                        sortBy === tab.key
                          ? "bg-white shadow-sm border border-[#EDE7D9] text-[#1A3A35] hover:bg-[#F5F0E8]"
                          : "text-gray-600 hover:bg-[#F5F0E8]"
                      }
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
                <select
                  value={sortBy === "popular" ? "default" : sortBy}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSortBy(value === "default" ? "popular" : (value as SortBy));
                  }}
                  className="px-4 py-2 bg-white border border-[#EDE7D9] rounded-lg text-sm"
                >
                  <option value="default">Sort by default</option>
                  <option value="topRated">Highest Rated</option>
                  <option value="mostExperience">Most Experience</option>
                  <option value="budget">Lowest Price</option>
                </select>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {loading ? "Loading teachers…" : `Showing ${teachers.length} teachers`}
              </div>
            </div>

            {/* Teacher Cards */}
            {!loading && teachers.length > 0 ? (
              <div className="space-y-3.5">
                {teachers.map((teacher) => (
                  <TeacherCardHorizontal key={teacher.id} teacher={teacher} />
                ))}
              </div>
            ) : !loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#1A3A35]/10">
                <p className="text-[#1A3A35] font-semibold mb-2">No teachers match your filters</p>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your search or clearing your filters.</p>
                <Button
                  variant="outline"
                  className="border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
