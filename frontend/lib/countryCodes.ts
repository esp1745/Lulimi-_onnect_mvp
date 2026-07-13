export interface CountryCode {
  name: string
  dialCode: string
  flag: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Nigeria', dialCode: '234', flag: '🇳🇬' },
  { name: 'Zambia', dialCode: '260', flag: '🇿🇲' },
  { name: 'Kenya', dialCode: '254', flag: '🇰🇪' },
  { name: 'South Africa', dialCode: '27', flag: '🇿🇦' },
  { name: 'Ghana', dialCode: '233', flag: '🇬🇭' },
  { name: 'Tanzania', dialCode: '255', flag: '🇹🇿' },
  { name: 'Uganda', dialCode: '256', flag: '🇺🇬' },
  { name: 'Ethiopia', dialCode: '251', flag: '🇪🇹' },
  { name: 'Rwanda', dialCode: '250', flag: '🇷🇼' },
  { name: 'Zimbabwe', dialCode: '263', flag: '🇿🇼' },
  { name: 'Malawi', dialCode: '265', flag: '🇲🇼' },
  { name: 'Mozambique', dialCode: '258', flag: '🇲🇿' },
  { name: 'Botswana', dialCode: '267', flag: '🇧🇼' },
  { name: 'Namibia', dialCode: '264', flag: '🇳🇦' },
  { name: 'Senegal', dialCode: '221', flag: '🇸🇳' },
  { name: 'Mali', dialCode: '223', flag: '🇲🇱' },
  { name: "Côte d'Ivoire", dialCode: '225', flag: '🇨🇮' },
  { name: 'Cameroon', dialCode: '237', flag: '🇨🇲' },
  { name: 'Democratic Republic of the Congo', dialCode: '243', flag: '🇨🇩' },
  { name: 'Republic of the Congo', dialCode: '242', flag: '🇨🇬' },
  { name: 'Angola', dialCode: '244', flag: '🇦🇴' },
  { name: 'Egypt', dialCode: '20', flag: '🇪🇬' },
  { name: 'Morocco', dialCode: '212', flag: '🇲🇦' },
  { name: 'Algeria', dialCode: '213', flag: '🇩🇿' },
  { name: 'Tunisia', dialCode: '216', flag: '🇹🇳' },
  { name: 'Sudan', dialCode: '249', flag: '🇸🇩' },
  { name: 'South Sudan', dialCode: '211', flag: '🇸🇸' },
  { name: 'Somalia', dialCode: '252', flag: '🇸🇴' },
  { name: 'Burundi', dialCode: '257', flag: '🇧🇮' },
  { name: 'Benin', dialCode: '229', flag: '🇧🇯' },
  { name: 'Togo', dialCode: '228', flag: '🇹🇬' },
  { name: 'Sierra Leone', dialCode: '232', flag: '🇸🇱' },
  { name: 'Liberia', dialCode: '231', flag: '🇱🇷' },
  { name: 'Guinea', dialCode: '224', flag: '🇬🇳' },
  { name: 'Gambia', dialCode: '220', flag: '🇬🇲' },
  { name: 'Gabon', dialCode: '241', flag: '🇬🇦' },
  { name: 'Lesotho', dialCode: '266', flag: '🇱🇸' },
  { name: 'Eswatini', dialCode: '268', flag: '🇸🇿' },
  { name: 'Madagascar', dialCode: '261', flag: '🇲🇬' },
  { name: 'Mauritius', dialCode: '230', flag: '🇲🇺' },
  { name: 'Chad', dialCode: '235', flag: '🇹🇩' },
  { name: 'Niger', dialCode: '227', flag: '🇳🇪' },
  { name: 'Burkina Faso', dialCode: '226', flag: '🇧🇫' },
  { name: 'Central African Republic', dialCode: '236', flag: '🇨🇫' },
  { name: 'Eritrea', dialCode: '291', flag: '🇪🇷' },
  { name: 'Djibouti', dialCode: '253', flag: '🇩🇯' },
  { name: 'Equatorial Guinea', dialCode: '240', flag: '🇬🇶' },
  { name: 'Cape Verde', dialCode: '238', flag: '🇨🇻' },
  { name: 'Guinea-Bissau', dialCode: '245', flag: '🇬🇼' },
  { name: 'Comoros', dialCode: '269', flag: '🇰🇲' },
  { name: 'United States', dialCode: '1', flag: '🇺🇸' },
  { name: 'Canada', dialCode: '1', flag: '🇨🇦' },
  { name: 'United Kingdom', dialCode: '44', flag: '🇬🇧' },
  { name: 'France', dialCode: '33', flag: '🇫🇷' },
  { name: 'Germany', dialCode: '49', flag: '🇩🇪' },
  { name: 'Portugal', dialCode: '351', flag: '🇵🇹' },
  { name: 'Spain', dialCode: '34', flag: '🇪🇸' },
  { name: 'Belgium', dialCode: '32', flag: '🇧🇪' },
  { name: 'Netherlands', dialCode: '31', flag: '🇳🇱' },
  { name: 'India', dialCode: '91', flag: '🇮🇳' },
  { name: 'China', dialCode: '86', flag: '🇨🇳' },
  { name: 'Brazil', dialCode: '55', flag: '🇧🇷' },
  { name: 'United Arab Emirates', dialCode: '971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', dialCode: '966', flag: '🇸🇦' },
  { name: 'Australia', dialCode: '61', flag: '🇦🇺' },
]

export const DEFAULT_COUNTRY_DIAL_CODE = '260'

export function parsePhoneNumber(fullNumber: string): { dialCode: string; localNumber: string } {
  const digits = (fullNumber || '').replace(/[^\d]/g, '')
  if (!digits) return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, localNumber: '' }

  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => digits.startsWith(c.dialCode))

  if (match) {
    return { dialCode: match.dialCode, localNumber: digits.slice(match.dialCode.length) }
  }
  return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, localNumber: digits }
}
