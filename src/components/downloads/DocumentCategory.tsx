/**
 * Document Category Component
 *
 * Groups documents by category with header and description.
 *
 * Story 18.5: Download Portal Page
 * Task 2.1: Create DocumentCategory component
 * Covers: AC3 (organized file categories)
 */

import {
  DocumentCategory as CategoryType,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from '@/lib/services/download-service';
import { DocumentCard, DocumentCardProps } from './DocumentCard';
import { FileText, FileSpreadsheet, Presentation } from 'lucide-react';

interface DocumentCategoryProps {
  category: CategoryType;
  documents: DocumentCardProps[];
  onRetry?: (documentId: string) => void;
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: CategoryType) {
  switch (category) {
    case 'strategic':
      return FileText;
    case 'tools':
      return FileSpreadsheet;
    case 'presentations':
      return Presentation;
    default:
      return FileText;
  }
}

/**
 * Get background color for category header
 */
function getCategoryColor(category: CategoryType): string {
  switch (category) {
    case 'strategic':
      return 'bg-blue-50 border-blue-200';
    case 'tools':
      return 'bg-green-50 border-green-200';
    case 'presentations':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
}

/**
 * Get icon color for category
 */
function getCategoryIconColor(category: CategoryType): string {
  switch (category) {
    case 'strategic':
      return 'text-blue-600';
    case 'tools':
      return 'text-green-600';
    case 'presentations':
      return 'text-orange-600';
    default:
      return 'text-slate-600';
  }
}

export function DocumentCategory({
  category,
  documents,
  onRetry,
}: DocumentCategoryProps) {
  const Icon = getCategoryIcon(category);
  const label = CATEGORY_LABELS[category];
  const description = CATEGORY_DESCRIPTIONS[category];
  const colorClass = getCategoryColor(category);
  const iconColorClass = getCategoryIconColor(category);

  if (documents.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-8"
      aria-labelledby={`category-${category}`}
      role="region"
    >
      {/* Category Header */}
      <div className={`p-4 rounded-t-lg border ${colorClass}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${iconColorClass}`} aria-hidden="true" />
          <div>
            <h2 id={`category-${category}`} className="font-semibold text-slate-900">
              {label}
            </h2>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3 pt-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} {...doc} onRetry={onRetry} />
        ))}
      </div>
    </section>
  );
}
