import { IntentResponseDto } from './intent-response.dto';

export class IntentBreadcrumbItemDto {
  slug: string;
  label: string;
  url: string;
}

export class IntentLinkItemDto {
  slug: string;
  linkLabel: string;
  url: string;
}

export class IntentPublicResponseDto extends IntentResponseDto {
  breadcrumbs: IntentBreadcrumbItemDto[];
  internalLinks: IntentLinkItemDto[];
  smartBadges: IntentLinkItemDto[];
}
