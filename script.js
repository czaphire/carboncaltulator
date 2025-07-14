document.addEventListener('DOMContentLoaded', () => {
  // Input + output refs
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const massInput = document.getElementById('massKg');
  const compareBtn = document.getElementById('compareBtn');

  const execSec = document.getElementById('execSummarySection');
  // const execText = document.getElementById('execSummaryText'); // Not used anymore!

  // Use the new metrics container inside the summary card
  const metricsSec = document.getElementById('impactMetricsContainer');
  const metricPlastic = document.getElementById('metricPlastic');
  const metricCO2 = document.getElementById('metricCO2');
  const metricWater = document.getElementById('metricWater');
  const metricEnergy = document.getElementById('metricEnergy');

  const chart1Sec = document.getElementById('chart1Section');
  const chart2Sec = document.getElementById('chart2Section');

  const methodSec = document.getElementById('methodologySection');
  const methodToggle = document.getElementById('methodToggle');
  const methodTable = document.getElementById('methodologyTable');
  const toggleIcon = document.getElementById('toggleIcon');

  const certBadge = document.getElementById('certBadge');
  const insightSec = document.getElementById('insightSection');

  // Collapsible rows in methodology
  document.querySelectorAll('.expandable-row').forEach(row => {
    row.addEventListener('click', () => {
      const targetId = row.dataset.target;
      const detailRow = document.getElementById(targetId);
      if (detailRow) {
        detailRow.classList.toggle('hide');
      }
    });
  });

  // LCA factors per kg
  const factors = {
    virgin: { co2: 2.7, water: 200, energy: 8.0 }, // avg CO₂e from 2.6–2.8
    pcr:    { co2: 0.7, water: 25, energy: 2.5 }   // avg CO₂e from 0.6–0.8
  };

  // Format helpers
  const formatNum = (val) => Math.abs(val - Math.round(val)) < 1e-6
    ? Math.round(val).toLocaleString()
    : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatPct = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // Chart setup
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

  // Methodology toggle
  methodToggle.addEventListener('click', () => {
    methodTable.classList.toggle('hide');
    toggleIcon.classList.toggle('fa-chevron-down');
    toggleIcon.classList.toggle('fa-chevron-up');
  });

  // Main LCA calculate button
  compareBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mass = parseFloat(massInput.value);

    if (!name || !email.includes('@') || isNaN(mass) || mass <= 0) {
      alert('❗ Please enter all fields correctly.');
      return;
    }

    const vEm = mass * factors.virgin.co2;
    const pEm = mass * factors.pcr.co2;
    const vW = mass * factors.virgin.water;
    const pW = mass * factors.pcr.water;
    const vE = mass * factors.virgin.energy;
    const pE = mass * factors.pcr.energy;
    const cSav = vEm - pEm;
    const pct = (cSav / vEm) * 100;

    // You no longer use execText; only show the summary box!
    execSec.classList.remove('hidden');

    metricPlastic.textContent = formatNum(mass);
    metricCO2.textContent = formatNum(cSav);
    metricWater.textContent = formatNum(vW - pW);
    metricEnergy.textContent = formatNum(vE - pE);
    metricsSec.classList.remove('hidden');

    emissionChart.data.datasets[0].data = [vEm, pEm];
    emissionChart.update();
    chart1Sec.classList.remove('hidden');

    savingsChart.data.datasets[0].data = [vW, vE, vEm];
    savingsChart.data.datasets[1].data = [pW, pE, pEm];
    savingsChart.update();
    chart2Sec.classList.remove('hidden');

    const tbody = methodTable.querySelector('tbody');
    tbody.innerHTML = `
      <tr class="expandable-row" data-target="virginDetail">
        <td>Virgin CO₂e</td><td>mass × ${factors.virgin.co2} kg CO₂e/kg</td>
      </tr>
      <tr class="collapse-content hide" id="virginDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead><tr><th>Lifecycle Stage</th><th>Description</th><th>CO₂e (kg/kg)</th></tr></thead>
            <tbody>
              <tr><td>Raw material</td><td>Crude oil extraction</td><td>~0.9</td></tr>
              <tr><td>Polymer production</td><td>Natural gas-heavy</td><td>~1.1</td></tr>
              <tr><td>Transport</td><td>Long distance in AUS</td><td>~0.4</td></tr>
              <tr><td>Packaging</td><td>Local manufacturers</td><td>~0.3</td></tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr class="expandable-row" data-target="pcrDetail">
        <td>Recree8® PCR CO₂e</td><td>mass × ${factors.pcr.co2} kg CO₂e/kg</td>
      </tr>
      <tr class="collapse-content hide" id="pcrDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead><tr><th>Lifecycle Stage</th><th>Description</th><th>CO₂e (kg/kg)</th></tr></thead>
            <tbody>
              <tr><td>Collection</td><td>Curbside/commercial</td><td>~0.15</td></tr>
              <tr><td>Transport</td><td>Regional</td><td>~0.1</td></tr>
              <tr><td>Reprocessing</td><td>Washing, pelletizing</td><td>~0.35</td></tr>
              <tr><td>Energy</td><td>Grid mix (~60–70% fossil)</td><td>~0.1–0.2</td></tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr class="expandable-row" data-target="waterVirginDetail">
        <td>Virgin Water</td><td>mass × ${factors.virgin.water} L/kg</td>
      </tr>
      <tr class="collapse-content hide" id="waterVirginDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead>
              <tr><th>Lifecycle Stage</th><th>Description</th><th>Water Use (L/kg)</th></tr>
            </thead>
            <tbody>
              <tr><td>Raw Material Extraction</td><td>Groundwater, imported oil</td><td>~60</td></tr>
              <tr><td>Polymer Production</td><td>Steam, cooling towers</td><td>~90</td></tr>
              <tr><td>Transport</td><td>Diesel fuel refinement</td><td>~25</td></tr>
              <tr><td>Packaging Conversion</td><td>Machinery, washing</td><td>~25</td></tr>
              <tr><td><strong>Total</strong></td><td></td><td><strong>~200</strong></td></tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr class="expandable-row" data-target="waterPcrDetail">
        <td>Recree8® PCR Water</td><td>mass × ${factors.pcr.water} L/kg</td>
      </tr>
      <tr class="collapse-content hide" id="waterPcrDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead>
              <tr><th>Lifecycle Stage</th><th>Description</th><th>Water Use (L/kg)</th></tr>
            </thead>
            <tbody>
              <tr><td>Collection, Sorting</td><td>Curbside/commercial</td><td>~3</td></tr>
              <tr><td>Transport</td><td>Low impact</td><td>~2</td></tr>
              <tr><td>Cleaning/Reprocessing</td><td>Washing, pelletizing</td><td>~15</td></tr>
              <tr><td>Energy Input</td><td>Grid-powered, indirect</td><td>~5</td></tr>
              <tr><td><strong>Total</strong></td><td></td><td><strong>~25</strong></td></tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr class="expandable-row" data-target="energyVirginDetail">
        <td>Virgin Energy</td><td>mass × ${factors.virgin.energy} kWh/kg</td>
      </tr>
      <tr class="collapse-content hide" id="energyVirginDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead><tr><th>Lifecycle Stage</th><th>Description</th><th>Energy Use (kWh/kg)</th></tr></thead>
            <tbody>
              <tr><td>Crude Oil Extraction</td><td>Drilling, transport</td><td>~1.5</td></tr>
              <tr><td>Polymerization</td><td>High-temp processing</td><td>~3.5</td></tr>
              <tr><td>Transport</td><td>Fuel & logistics</td><td>~1.0</td></tr>
              <tr><td>Packaging Conversion</td><td>Extrusion/molding</td><td>~2.0</td></tr>
              <tr><td><strong>Total</strong></td><td></td><td><strong>~8.0</strong></td></tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr class="expandable-row" data-target="energyPcrDetail">
        <td>Recree8® PCR Energy</td><td>mass × ${factors.pcr.energy} kWh/kg</td>
      </tr>
      <tr class="collapse-content hide" id="energyPcrDetail">
        <td colspan="2">
          <table class="sub-method-table">
            <thead><tr><th>Lifecycle Stage</th><th>Description</th><th>Energy Use (kWh/kg)</th></tr></thead>
            <tbody>
              <tr><td>Collection, Sorting</td><td>Machinery use</td><td>~0.2</td></tr>
              <tr><td>Transport</td><td>Regional trucks</td><td>~0.2</td></tr>
              <tr><td>Reprocessing</td><td>Washing, pelletizing</td><td>~1.8</td></tr>
              <tr><td>Grid Energy Input</td><td>Fossil-heavy electricity</td><td>~0.3</td></tr>
              <tr><td><strong>Total</strong></td><td></td><td><strong>~2.5</strong></td></tr>
            </tbody>
          </table>
        </td>
      </tr>
    `;

    // Re-bind collapsible row toggles
    document.querySelectorAll('.expandable-row').forEach(row => {
      row.addEventListener('click', () => {
        const targetId = row.dataset.target;
        const detailRow = document.getElementById(targetId);
        if (detailRow) {
          detailRow.classList.toggle('hide');
        }
      });
    });

    methodTable.classList.add('hide');
    toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    methodSec.classList.remove('hidden');
    certBadge.classList.remove('hidden');
  });

  // Metric card click toggle
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const value = parseFloat(card.querySelector('.metric-value span').textContent.replace(/,/g, ''));

      const map = {
        plastic: 'insightPlastic',
        co2: 'insightCO2',
        water: 'insightWater',
        energy: 'insightEnergy'
      };

      const insightBox = document.getElementById(map[type]);
      const indicator = card.querySelector('.metric-indicator');
      const isVisible = insightBox.classList.contains('show');

      // Reset
      document.querySelectorAll('.insight-card').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('show');
      });
      document.querySelectorAll('.metric-indicator').forEach(el => el.classList.remove('show'));

      // Toggle on
      if (!isVisible) {
        insightBox.classList.remove('hidden');
        insightBox.classList.add('show');
        indicator.classList.add('show');

        switch (type) {
          case 'plastic':
            const plasticMass = parseFloat(document.getElementById('massKg').value);
            insightBox.innerHTML = `
              <img src="https://cdn-icons-png.flaticon.com/512/2909/2909763.png" />
              <strong>${plasticMass.toLocaleString()} kg plastic displaced</strong><br><br>
              That’s like removing ~${Math.round(plasticMass * 200).toLocaleString()} plastic bottles from nature 🌏<br>
              <em>Recree8® helps you tackle plastic waste, 1 bottle at a time.</em>
            `;
            break;

          case 'co2':
            const massCO2 = parseFloat(document.getElementById('massKg').value);
            const vCO2 = massCO2 * factors.virgin.co2;
            const pCO2 = massCO2 * factors.pcr.co2;
            const savedCO2 = vCO2 - pCO2;
            insightBox.innerHTML = `
              <img src="https://cdn-icons-png.flaticon.com/512/481/481431.png" />
              <strong>${savedCO2.toLocaleString()} kg CO₂e avoided</strong><br>
              Virgin: <strong>${vCO2.toLocaleString()} kg</strong><br>
              Recree8® PCR: <strong>${pCO2.toLocaleString()} kg</strong><br><br>
              🌿 That’s like avoiding ${Math.round(savedCO2 * 4).toLocaleString()} km of car travel!<br>
              <em>Recree8® helps you cut your emissions and protect the air we breathe.</em>
            `;
            break;

          case 'water':
            const massWater = parseFloat(document.getElementById('massKg').value);
            const virginWater = massWater * factors.virgin.water;
            const pcrWater = massWater * factors.pcr.water;
            const savedWater = virginWater - pcrWater;
            insightBox.innerHTML = `
              <img src="https://cdn-icons-png.flaticon.com/512/728/728093.png" />
              <strong>${savedWater.toLocaleString()} L of water saved</strong><br>
              Virgin: <strong>${virginWater.toLocaleString()} L</strong><br>
              Recree8® PCR: <strong>${pcrWater.toLocaleString()} L</strong><br><br>
              💧 That’s enough for <strong>${Math.round(savedWater / 2).toLocaleString()}</strong> people for a day.<br>
              <em>Preserve every drop. Choose smarter water usage with Recree8®.</em>
            `;
            break;

          case 'energy':
            const massEnergy = parseFloat(document.getElementById('massKg').value);
            const virginEnergy = massEnergy * factors.virgin.energy;
            const pcrEnergy = massEnergy * factors.pcr.energy;
            const savedEnergy = virginEnergy - pcrEnergy;
            insightBox.innerHTML = `
              <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" />
              <strong>${savedEnergy.toLocaleString()} kWh of energy saved</strong><br>
              Virgin: <strong>${virginEnergy.toLocaleString()} kWh</strong><br>
              Recree8® PCR: <strong>${pcrEnergy.toLocaleString()} kWh</strong><br><br>
              ⚡ Enough to power an LED bulb for <strong>${Math.round(savedEnergy * 50).toLocaleString()}</strong> hours!<br>
              <em>Less energy use = less emissions. Be part of the smarter solution.</em>
            `;
            break;
        }
      }
    });
  });

});
