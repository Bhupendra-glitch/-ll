import { SimulationParams, SimulationResult, WorkerProfile, MonteCarloPath } from '../types';

export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

export function runMonteCarloTwinSimulation(
  profile: WorkerProfile,
  params: SimulationParams
): SimulationResult {
  const { principal, tenureMonths, frequency, interestRateAnnual, stressScenario } = params;

  // Monthly formal EMI
  const monthlyEmi = calculateEmi(principal, interestRateAnnual, tenureMonths);
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - principal);

  // Informal lender comparison: 48% annual (4% per month meter vaddi)
  const informalMonthlyEmi = calculateEmi(principal, 48, tenureMonths);
  const informalTotalRepayment = informalMonthlyEmi * tenureMonths;
  const informalComparisonInterest = Math.max(0, informalTotalRepayment - principal);
  const interestSaved = Math.max(0, informalComparisonInterest - totalInterest);

  // Frequency adjustment
  let emiAmount = monthlyEmi;
  let dailyEquivalentEmi = Math.round(monthlyEmi / 30);
  if (frequency === 'daily') {
    emiAmount = dailyEquivalentEmi;
  } else if (frequency === 'weekly') {
    emiAmount = Math.round((monthlyEmi * 12) / 52);
  }

  // Base daily income and expenses
  let baseDailyIncome = profile.monthlyAvgInflow / 30;
  const baseDailyLivingExpense = (profile.monthlyAvgInflow - profile.monthlyNetSurplus) / 30;

  // Apply scenario modifiers
  let incomeMultiplier = 1.0;
  let suddenShockDay = -1;
  let shockExpense = 0;

  if (stressScenario === 'monsoon_slump') {
    incomeMultiplier = 0.75; // -25% due to weather / order drop
  } else if (stressScenario === 'health_emergency') {
    suddenShockDay = 18;
    shockExpense = 8500; // Medical out-of-pocket shock
  } else if (stressScenario === 'festive_boom') {
    incomeMultiplier = 1.35; // +35% festive surge
  }

  // Run Monte Carlo runs
  const SIMULATION_RUNS = 1000;
  const DAYS = 60; // 60-day forward projection
  let breachedCount = 0;

  const visualPaths: MonteCarloPath[] = [];
  const samplePathCount = 20;

  // Normal distribution random generator
  function randomNormal(mean: number, stdev: number) {
    let u = 1 - Math.random();
    let v = Math.random();
    return mean + stdev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  for (let r = 0; r < SIMULATION_RUNS; r++) {
    let cashBalance = profile.monthlyNetSurplus * 0.7; // Initial liquid reserve (approx 20 days buffer)
    const points: number[] = [cashBalance];
    let isBreached = false;

    for (let day = 1; day <= DAYS; day++) {
      // Stochastic daily earning
      const dayVariance = randomNormal(1.0, 0.18);
      const dayIncome = baseDailyIncome * incomeMultiplier * Math.max(0.3, dayVariance);
      let dayExpense = baseDailyLivingExpense * randomNormal(1.0, 0.08);

      // Sudden shock
      if (day === suddenShockDay) {
        dayExpense += shockExpense;
      }

      // EMI Deduction
      let deduction = 0;
      if (frequency === 'daily') {
        deduction = dailyEquivalentEmi;
      } else if (frequency === 'weekly' && day % 7 === 0) {
        deduction = Math.round((monthlyEmi * 12) / 52);
      } else if (frequency === 'monthly' && day % 30 === 0) {
        deduction = monthlyEmi;
      }

      cashBalance += (dayIncome - dayExpense - deduction);
      points.push(Math.round(cashBalance));

      if (cashBalance < 0) {
        isBreached = true;
      }
    }

    if (isBreached) {
      breachedCount++;
    }

    if (r < samplePathCount) {
      visualPaths.push({
        id: r,
        points,
        isBreached,
      });
    }
  }

  const defaultProbability = Math.round((breachedCount / SIMULATION_RUNS) * 1000) / 10; // e.g. 3.2%
  const monthlyRemaining = profile.monthlyNetSurplus - monthlyEmi;
  const cashflowBufferRemaining = Math.max(
    0,
    Math.min(100, Math.round((monthlyRemaining / profile.monthlyNetSurplus) * 100))
  );

  let safeZone: SimulationResult['safeZone'] = 'OPTIMAL';
  let safeZoneLabel = {
    en: 'Safe Borrowing Zone (Optimal)',
    hi: 'सुरक्षित ऋण क्षेत्र (सर्वोत्तम)',
    ta: 'பாதுகாப்பான கடன் வரம்பு (சிறந்தது)',
  };

  if (defaultProbability > 22 || cashflowBufferRemaining < 25) {
    safeZone = 'DANGER';
    safeZoneLabel = {
      en: 'High Debt Stress (Unsafe)',
      hi: 'उच्च जोखिम ऋण (खतरे का क्षेत्र)',
      ta: 'அதிக நிதி நெருக்கடி (ஆபத்தானது)',
    };
  } else if (defaultProbability > 10 || cashflowBufferRemaining < 45) {
    safeZone = 'CAUTION';
    safeZoneLabel = {
      en: 'Moderate Strain (Caution)',
      hi: 'मध्यम दबाव (सावधानी रखें)',
      ta: 'மிதமான நெருக்கடி (கவனம் தேவை)',
    };
  } else if (defaultProbability > 5 || cashflowBufferRemaining < 65) {
    safeZone = 'MODERATE';
    safeZoneLabel = {
      en: 'Manageable Micro-Loan',
      hi: 'प्रबंधन योग्य ऋण',
      ta: 'எளிதில் சமாளிக்கக்கூடிய கடன்',
    };
  }

  return {
    emiAmount,
    totalRepayment,
    totalInterest,
    informalComparisonInterest,
    interestSaved,
    defaultProbability,
    cashflowBufferRemaining,
    safeZone,
    safeZoneLabel,
    simulatedPaths: visualPaths,
    dailyP10Cashflow: Math.round(baseDailyIncome * 0.75 - dailyEquivalentEmi),
    dailyP50Cashflow: Math.round(baseDailyIncome - dailyEquivalentEmi),
    dailyP90Cashflow: Math.round(baseDailyIncome * 1.3 - dailyEquivalentEmi),
  };
}
