import { TokenService } from 'space-react-client';

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
  tokenService.update(localStorage.getItem('pricingToken') || '');
}

export function camelToTitle(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/_/g, ' ');
}

// Ensure a feature name is presented in human readable form.
// If the name already contains spaces or non-camel separators, we normalize capitalization.
export function humanizeFeatureName(name?: string) {
  if (!name) return '';
  // Replace underscores/dashes with spaces
  const normalized = name.replace(/[_-]+/g, ' ').trim();
  // If it contains spaces it might already be human, so just capitalize each word
  if (normalized.includes(' ')) {
    return normalized
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  // Otherwise assume camelCase or PascalCase and convert
  return camelToTitle(normalized).replace(/\s+/g, ' ').trim();
}

// Helper: convert string to camelCase
export function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove non-alphanumeric except space
    .replace(/(?:^|\s)([a-zA-Z])/g, (_, c) => (c ? c.toUpperCase() : '')) // Capitalize first letter of each word
    .replace(/\s+/g, '') // Remove spaces
    .replace(/^([A-Z])/, m => m.toLowerCase()); // Lowercase first char
}

export function computePriceSplit(plans: Record<string, { price: number }>) {
  
  if (!plans || typeof plans !== 'object') {
    throw new Error('Invalid plans data');
  }
  
  const minPrice = Math.min(...Object.values(plans).map(plan => plan.price));
  const maxPrice = Math.max(...Object.values(plans).map(plan => plan.price));

  const priceRange = maxPrice - minPrice;
  const split = priceRange / 3;

  return split;
}