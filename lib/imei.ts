/**
 * IMEI validation. An IMEI is 15 digits and the last digit is a Luhn
 * check digit over the full number.
 */

export function normalizeImei(input: string): string {
  return input.replace(/[\s-]/g, "");
}

export function isValidImei(input: string): boolean {
  const imei = normalizeImei(input);
  if (!/^\d{15}$/.test(imei)) return false;
  return luhnChecksumValid(imei);
}

function luhnChecksumValid(digits: string): boolean {
  let sum = 0;
  // Walk right-to-left; double every second digit.
  for (let i = digits.length - 1, alt = false; i >= 0; i--, alt = !alt) {
    let d = digits.charCodeAt(i) - 48;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function imeiError(input: string): string | null {
  const imei = normalizeImei(input);
  if (imei.length === 0) return "IMEI is required.";
  if (!/^\d+$/.test(imei)) return "IMEI must contain only digits.";
  if (imei.length !== 15) return `IMEI must be exactly 15 digits (you entered ${imei.length}).`;
  if (!luhnChecksumValid(imei))
    return "That doesn't look like a valid IMEI (checksum failed). Dial *#06# on the phone to double-check, or read it off the phone box.";
  return null;
}
