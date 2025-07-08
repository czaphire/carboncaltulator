document.addEventListener('DOMContentLoaded', () => {
  // Element refs
  const nameInput     = document.getElementById('name');
  const emailInput    = document.getElementById('email');
  const massInput     = document.getElementById('massKg');
  const compareBtn    = document.getElementById('compareBtn');

  const execSec       = document.getElementById('execSummarySection');
  const execText      = document.getElementById('execSummaryText');

  const metricsSec    = document.getElementById('metricsSection');
  const metricPlastic = document.getElementById('metricPlastic');
  const metricCO2     = document.getElementById('metricCO2');
  const metricWater   = document.getElementById('metricWater');
  const metricEnergy  = document.getElementById('metricEnergy');

  const chart1Sec     = document.getElementById('chart1Section');
  const chart2Sec     = document.getElementById('chart2Section');

  const methodSec     = document.getElementById('methodologySection');
  const methodToggle  = document.getElementById('methodToggle');
  const methodTable   = document.getElementById('methodologyTable');
  const toggleIcon    = document.getElementById('toggleIcon');

  const certBadge     = document.getElementById('certBadge');

  // LCA factors per kg of plastic
  const factors = {
    virgin: { co2: 3.0,  water: 200, energy: 8.0 },
    pcr:    { co2: 1.0,  water:  25, energy: 2.5 }
  };

  // Number formatting helpers
  function formatNum(value) {
    if (Math.abs(value - Math.round(value)) < 1e-6) {
      return Math.round(value).toLocaleString('en-US');
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  function formatPct(value) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  }

  // Chart 1: CO₂e Emissions
  const ctx1 = document.getElementById('emissionChart').getContext('2d');
  const emissionChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Virgin', 'Recree8® PCR'],
      datasets: [{
        label: 'kg CO₂e per kg',
        data: [0, 0],
        backgroundColor: ['#106552', '#ffba08'],
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'kg CO₂e' },
          ticks: { callback: val => formatNum(val) }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Chart 2: Impacts Comparison
  const ctx2 = document.getElementById('savingsChart').getContext('2d');
  const savingsChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['Water (L)', 'Energy (kWh)', 'CO₂e (kg)'],
      datasets: [
        {
          label: 'Virgin',
          data: [0, 0, 0],
          backgroundColor: '#106552',
          borderRadius: 6,
          barThickness: 40
        },
        {
          label: 'Recree8® PCR',
          data: [0, 0, 0],
          backgroundColor: '#ffba08',
          borderRadius: 6,
          barThickness: 40
        }
      ]
    },
    options: {
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: val => formatNum(val) }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Toggle Methodology Table
  methodToggle.addEventListener('click', () => {
    methodTable.classList.toggle('hide');
    toggleIcon.classList.toggle('fa-chevron-down');
    toggleIcon.classList.toggle('fa-chevron-up');
  });

  // Main Compute Handler
  compareBtn.addEventListener('click', () => {
    // Validate name & email
    const name  = nameInput.value.trim();
    if (!name) {
      alert('❗ Please enter your name.');
      return;
    }
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      alert('❗ Please enter a valid email address.');
      return;
    }

    // Validate mass
    const mass = parseFloat(massInput.value);
    if (isNaN(mass) || mass <= 0) {
      alert('❗ Please enter a positive mass in kg.');
      return;
    }

    // Compute impacts
    const vEm  = mass * factors.virgin.co2;
    const pEm  = mass * factors.pcr.co2;
    const vW   = mass * factors.virgin.water;
    const pW   = mass * factors.pcr.water;
    const vE   = mass * factors.virgin.energy;
    const pE   = mass * factors.pcr.energy;
    const cSav = vEm - pEm;
    const pct  = (cSav / vEm) * 100;

    // Executive Summary (new wording)
    execText.innerHTML = `
      Using virgin plastic material emits ${formatNum(vEm)} kg CO₂e, while Recree8® PCR material emits only ${formatNum(pEm)} kg CO₂e.<br><br>
      <strong>You save ${formatNum(cSav)} kg CO₂e by choosing Recree8® PCR.</strong><br>
      That's a ${formatPct(pct)} deduction from using Recree8® PCR instead of virgin plastic material.
    `;
    execSec.classList.remove('hidden');

    // Metrics Section
    metricPlastic.textContent = formatNum(mass);
    metricCO2.textContent     = formatNum(cSav);
    metricWater.textContent   = formatNum(vW - pW);
    metricEnergy.textContent  = formatNum(vE - pE);
    metricsSec.classList.remove('hidden');

    // Update Chart 1
    emissionChart.data.datasets[0].data = [vEm, pEm];
    emissionChart.update();
    chart1Sec.classList.remove('hidden');

    // Update Chart 2
    savingsChart.data.datasets[0].data = [vW, vE, vEm];
    savingsChart.data.datasets[1].data = [pW, pE, pEm];
    savingsChart.update();
    chart2Sec.classList.remove('hidden');

    // Methodology Table
    const rows = [
      { metric: 'Virgin CO₂e',           formula: `mass × ${factors.virgin.co2} kg CO₂e/kg` },
      { metric: 'Recree8® PCR CO₂e',     formula: `mass × ${factors.pcr.co2} kg CO₂e/kg` },
      { metric: 'Virgin Water',          formula: `mass × ${factors.virgin.water} L/kg` },
      { metric: 'Recree8® PCR Water',    formula: `mass × ${factors.pcr.water} L/kg` },
      { metric: 'Virgin Energy',         formula: `mass × ${factors.virgin.energy} kWh/kg` },
      { metric: 'Recree8® PCR Energy',   formula: `mass × ${factors.pcr.energy} kWh/kg` },
      { metric: 'CO₂e Savings',          formula: 'virgin CO₂e − Recree8® PCR CO₂e' }
    ];
    const tbody = methodTable.querySelector('tbody');
    tbody.innerHTML = rows.map(r =>
      `<tr><td>${r.metric}</td><td>${r.formula}</td></tr>`
    ).join('');
    methodTable.classList.add('hide');
    toggleIcon.classList.replace('fa-chevron-up','fa-chevron-down');
    methodSec.classList.remove('hidden');

    // Show Certification Badge
    certBadge.classList.remove('hidden');
  });
});
