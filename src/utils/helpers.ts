import { TokenService } from 'space-react-client';
import axios from '../lib/axios';

export function formatToCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, '');
}

export function revertCamelCaseToString(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])([0-9])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

export async function renewToken(tokenService: TokenService): Promise<void> {
  return axios.post('/contracts/renew-token').then(response => {
    const pricingToken = response.data.pricingToken;

    tokenService.updatePricingToken(pricingToken);
  });
}

export function camelToTitle(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/_/g, ' ');
}

// Helper: convert string to camelCase
export function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove non-alphanumeric except space
    .replace(/(?:^|\s)([a-zA-Z])/g, (_, c) => (c ? c.toUpperCase() : '')) // Capitalize first letter of each word
    .replace(/\s+/g, '') // Remove spaces
    .replace(/^([A-Z])/, m => m.toLowerCase()); // Lowercase first char
}
