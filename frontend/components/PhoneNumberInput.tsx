import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { COUNTRY_CODES, parsePhoneNumber } from '@/lib/countryCodes'

export default function PhoneNumberInput({ value, onChange, placeholder }: {
  value: string
  onChange: (fullNumber: string) => void
  placeholder?: string
}) {
  const { localNumber } = parsePhoneNumber(value)
  // Tracked separately from `value` so picking a country before typing any digits
  // (which produces an empty `value`, since there's nothing to save yet) doesn't
  // snap the dropdown back to the default country.
  const [dialCode, setDialCode] = useState(() => parsePhoneNumber(value).dialCode)

  useEffect(() => {
    if (value) setDialCode(parsePhoneNumber(value).dialCode)
  }, [value])

  const emit = (nextDialCode: string, nextLocalNumber: string) => {
    setDialCode(nextDialCode)
    const digits = nextLocalNumber.replace(/[^\d]/g, '')
    onChange(digits ? `+${nextDialCode}${digits}` : '')
  }

  return (
    <div className="flex gap-2">
      <select
        value={dialCode}
        onChange={(e) => emit(e.target.value, localNumber)}
        className="border rounded-md px-2 py-2 text-sm bg-white w-28 shrink-0"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={`${c.name}-${c.dialCode}`} value={c.dialCode}>
            {c.flag} +{c.dialCode}
          </option>
        ))}
      </select>
      <Input
        value={localNumber}
        onChange={(e) => emit(dialCode, e.target.value)}
        placeholder={placeholder || '971234567'}
        inputMode="numeric"
        className="flex-1"
      />
    </div>
  )
}
