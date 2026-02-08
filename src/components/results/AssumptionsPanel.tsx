'use client';

/**
 * AssumptionsPanel Component
 *
 * Displays the assumptions underlying the calculation, including
 * salary band hourly rates and weeks per year.
 *
 * Covers: FR19 - Show assumptions underlying the calculation
 * AC: 3 - Users see assumptions (salary band values, etc.)
 */

interface SalaryBandRate {
  band: string;
  rate: string;
}

const SALARY_BANDS: SalaryBandRate[] = [
  { band: 'Executive', rate: '$150/hour' },
  { band: 'Senior', rate: '$100/hour' },
  { band: 'Mid-level', rate: '$65/hour' },
  { band: 'Entry', rate: '$35/hour' },
];

export function AssumptionsPanel() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Assumptions</h3>

      {/* Salary Band Rates Table */}
      <div className="space-y-2">
        <h4 className="text-sm text-muted-foreground">Salary Band Hourly Rates</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium text-foreground">Salary Band</th>
              <th className="text-right py-2 font-medium text-foreground">Hourly Rate</th>
            </tr>
          </thead>
          <tbody>
            {SALARY_BANDS.map(({ band, rate }) => (
              <tr key={band} className="border-b border-border last:border-b-0">
                <td className="py-2 text-muted-foreground">{band}</td>
                <td className="py-2 text-right text-foreground">{rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Assumptions */}
      <div className="space-y-2">
        <h4 className="text-sm text-muted-foreground">Other Assumptions</h4>
        <dl className="text-sm">
          <div className="flex justify-between py-1">
            <dt className="text-muted-foreground">Weeks per year</dt>
            <dd className="text-foreground">52</dd>
          </div>
        </dl>
      </div>

      {/* Methodology Context */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          These rates are based on the alignment tax methodology from{' '}
          <span className="font-medium text-foreground">&quot;The Last Paradigm&quot;</span>.
          Hourly rates represent fully-loaded compensation costs including benefits
          and overhead.
        </p>
      </div>
    </div>
  );
}
