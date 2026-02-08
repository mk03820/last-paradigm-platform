/**
 * Excel Template Download API
 *
 * GET /api/templates/excel
 *
 * Generates and serves the Meeting Audit Calculator Excel template.
 * Template includes all input fields, visible formulas, instructions,
 * and platform URL messaging.
 *
 * Covers: FR1.5-1, FR1.5-4, FR1.5-5, FR1.5-6, FR1.5-7
 */

import { NextResponse } from 'next/server';
import { generateExcelBuffer } from '@/lib/templates/excel-template';

export async function GET() {
  try {
    const buffer = await generateExcelBuffer();

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `meeting-audit-calculator-${date}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[templates/excel] Error generating template:', error);
    return NextResponse.json(
      { success: false, error: { code: 'GENERATION_ERROR', message: 'Failed to generate Excel template' } },
      { status: 500 }
    );
  }
}
