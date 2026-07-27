export interface StepCardData {
  number: string;
  badgeColor: string;
  image: string;
  title: string;
  description: string;
}

export function StepCards({ steps }: { steps: StepCardData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
      {steps.map((step) => (
        <div key={step.number} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative px-6 pt-6">
            <span
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: step.badgeColor }}
            >
              {step.number}
            </span>
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-44 object-cover object-top rounded-xl"
            />
          </div>
          <div className="relative p-6 pt-5 overflow-hidden">
            <span
              className="absolute -top-2 right-3 text-6xl font-bold text-[#1A3A35]/5 select-none"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {step.number}
            </span>
            <h3 className="relative font-bold text-lg text-[#1A3A35] mb-2">{step.title}</h3>
            <p className="relative text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
