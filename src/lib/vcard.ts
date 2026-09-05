import type { LegacyBusiness } from './legacyBusinessAdapter';

export function downloadVCard(business: LegacyBusiness): void {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${business.name}`, `ORG:${business.name}`];

  if (business.contact.phone.active && business.contact.phone.value) {
    lines.push(`TEL;TYPE=WORK,VOICE:${business.contact.phone.value}`);
  }
  if (business.contact.email.active && business.contact.email.value) {
    lines.push(`EMAIL:${business.contact.email.value}`);
  }
  const website = business.socialMedia.find((s) => s.platform === 'website' && s.active);
  if (website) lines.push(`URL:${website.url}`);
  if (business.location?.address) {
    lines.push(`ADR;TYPE=WORK:;;${business.location.address};${business.location.city ?? ''};;;`);
  }
  if (business.tagline) lines.push(`NOTE:${business.tagline}`);

  lines.push('END:VCARD');

  const blob = new Blob([lines.join('\n')], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${business.name}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
