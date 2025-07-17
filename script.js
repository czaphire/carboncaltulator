document.addEventListener('DOMContentLoaded', () => {
  // ─── Refs ────────────────────────────────────────────────────────
  const nameInput      = document.getElementById('name');
  const emailInput     = document.getElementById('email');
  const massInput      = document.getElementById('massKg');
  const compareBtn     = document.getElementById('compareBtn');

  const execSec        = document.getElementById('execSummarySection');
  const summaryToggle  = document.getElementById('summaryToggle');
  const summaryIcon    = document.getElementById('summaryToggleIcon');
  const summaryContent = document.getElementById('summaryContent');

  const metricPlastic  = document.getElementById('metricPlastic');
  const metricCO2      = document.getElementById('metricCO2');
  const metricWater    = document.getElementById('metricWater');
  const metricEnergy   = document.getElementById('metricEnergy');

  const insightSec     = document.getElementById('insightSection');
  const insightPlastic = document.getElementById('insightPlastic');
  const insightCO2     = document.getElementById('insightCO2');
  const insightWater   = document.getElementById('insightWater');
  const insightEnergy  = document.getElementById('insightEnergy');

  const chart1Sec = document.getElementById('chart1Section');
  const chart2Sec = document.getElementById('chart2Section');
  const ctx1      = document.getElementById('emissionChart').getContext('2d');
  const ctx2      = document.getElementById('savingsChart').getContext('2d');

  const methodSec    = document.getElementById('methodologySection');
  const methodToggle = document.getElementById('methodToggle');
  const methodIcon   = document.getElementById('methodToggleIcon');
  const methodTable  = document.getElementById('methodologyTable');
  const certBadge    = document.getElementById('certBadge');

  // ─── LCA Factors & Formatter ──────────────────────────────────────
  const factors = {
    virgin: { co2: 3.5, water: 180, energy: 12.1 },
    pcr:    { co2: 0.7, water: 105, energy:  5.2 }
  };
  const formatNum = v =>
    Math.abs(v - Math.round(v)) < 1e-6
      ? Math.round(v).toLocaleString()
      : v.toLocaleString('en-US',{
          minimumFractionDigits:2,
          maximumFractionDigits:2
        });

  // ─── Charts Setup ────────────────────────────────────────────────
  const emissionChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Virgin','Recree8® PCR'],
      datasets: [{
        label: 'kg CO₂e per kg',
        data: [0,0],
        backgroundColor: ['#106552','#ffba08'],
        borderRadius: 6,
        barThickness: 40
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'kg CO₂e' },
          ticks: { callback: t => formatNum(t) }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      events: ['mousemove','mouseout','click','touchstart','touchmove'],
      interaction: { mode: 'index', intersect: false },
      onClick: (evt, activeEls, chart) => {
        if (!activeEls.length) return;
        chart.tooltip.setActiveElements(activeEls, { x: evt.x, y: evt.y });
        chart.update();
      }
    }
  });

  const savingsChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['Water (L)','Energy (kWh)','CO₂e (kg)'],
      datasets: [
        { label: 'Virgin',       data: [0,0,0], backgroundColor: '#106552', borderRadius: 6, barThickness: 40 },
        { label: 'Recree8® PCR', data: [0,0,0], backgroundColor: '#ffba08', borderRadius: 6, barThickness: 40 }
      ]
    },
    options: {
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: t => formatNum(t) }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      events: ['mousemove','mouseout','click','touchstart','touchmove'],
      interaction: { mode: 'index', intersect: false },
      onClick: (evt, activeEls, chart) => {
        if (!activeEls.length) return;
        chart.tooltip.setActiveElements(activeEls, { x: evt.x, y: evt.y });
        chart.update();
      }
    }
  });

  // ─── Collapsible Summary ─────────────────────────────────────────
  summaryToggle.addEventListener('click', () => {
    summaryContent.classList.toggle('hide');
    summaryIcon.classList.toggle('fa-chevron-down');
    summaryIcon.classList.toggle('fa-chevron-up');
  });

  // ─── Collapsible Methodology ─────────────────────────────────────
  methodToggle.addEventListener('click', () => {
    methodTable.classList.toggle('hide');
    methodIcon.classList.toggle('fa-chevron-down');
    methodIcon.classList.toggle('fa-chevron-up');
  });

  // ─── Category & Sub‐Group Toggles ───────────────────────────────
  document.querySelectorAll('tr.group').forEach(row => {
    const ic = row.querySelector('.toggle-icon');
    row.addEventListener('click', () => {
      let nxt = row.nextElementSibling;
      while (nxt && !nxt.classList.contains('group')) {
        nxt.classList.toggle('hide');
        if (nxt.classList.contains('subdetail')) nxt.classList.add('hide');
        if (nxt.classList.contains('subgroup'))
          nxt.querySelector('.toggle-icon').classList.remove('fa-chevron-down','fa-chevron-up');
        nxt = nxt.nextElementSibling;
      }
      ic.classList.toggle('fa-chevron-down');
      ic.classList.toggle('fa-chevron-up');
    });
  });
  document.querySelectorAll('tr.subgroup').forEach(row => {
    const ic = row.querySelector('.toggle-icon');
    row.addEventListener('click', () => {
      document.getElementById(row.dataset.target).classList.toggle('hide');
      ic.classList.toggle('fa-chevron-down');
      ic.classList.toggle('fa-chevron-up');
    });
  });

  // ─── Run LCA Button ─────────────────────────────────────────────
  compareBtn.addEventListener('click', () => {
    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mass  = parseFloat(massInput.value);
    if (!name || !email.includes('@') || isNaN(mass) || mass <= 0) {
      alert('❗ Please enter all fields correctly.');
      return;
    }

    // Compute impacts
    const vEm  = mass * factors.virgin.co2,
          pEm  = mass * factors.pcr.co2;
    const vW   = mass * factors.virgin.water,
          pW   = mass * factors.pcr.water;
    const vE   = mass * factors.virgin.energy,
          pE   = mass * factors.pcr.energy;
    const cSav = vEm - pEm;
	const resultPlastic = mass;             // kg plastic displaced
	const resultCO2     = vEm - pEm;         // kg CO₂e avoided
	const resultWater   = vW - pW;           // L water saved
	const resultEnergy  = vE - pE;           // kWh energy saved
	const insight_bottles = Math.round(resultPlastic * 200);       // ~ bottles removed
	const insight_car     = Math.round(resultCO2 * 4);             // ~ km car travel avoided
	const insight_people  = Math.round(resultWater / 2);           // ~ people/day water saved
	const insight_hours   = Math.round(resultEnergy * 50);         // ~ hours of LED bulb

	// ─── 2) Capture submission date (Manila timezone) ─────────────
	 const now      = new Date();
	 const leadDate = now.toLocaleString('en-PH', {
		timeZone: 'Asia/Manila',
		year:     'numeric',
		month:    'long',
		day:      'numeric',
		hour:     '2-digit',
		minute:   '2-digit'
	 });
    // Show & auto-open summary
    execSec.classList.remove('hidden');
    summaryContent.classList.remove('hide');
    summaryIcon.classList.replace('fa-chevron-down','fa-chevron-up');

    // Reveal the insights container
    insightSec.classList.remove('hidden');

    // Populate metric values
    metricPlastic.textContent = formatNum(mass);
    metricCO2.textContent     = formatNum(cSav);
    metricWater.textContent   = formatNum(vW - pW);
    metricEnergy.textContent  = formatNum(vE - pE);

    // Update charts
    emissionChart.data.datasets[0].data = [vEm, pEm];
    emissionChart.update();
    chart1Sec.classList.remove('hidden');

    savingsChart.data.datasets[0].data = [vW, vE, vEm];
    savingsChart.data.datasets[1].data = [pW, pE, pEm];
    savingsChart.update();
    chart2Sec.classList.remove('hidden');

    // Reveal methodology & badge
    methodSec.classList.remove('hidden');
    methodTable.classList.add('hide');
    methodIcon.classList.replace('fa-chevron-up','fa-chevron-down');
    certBadge.classList.remove('hidden');

    // ─── EMAILJS: Send confirmation to the user ────────────────────
    emailjs.send('service_s6mj7hb', 'template_q4q6ud2', {
    user_name:       name,
    user_email:      email,
    mass:            mass.toString(),
    result_plastic:  resultPlastic.toString(),
    result_co2:      resultCO2.toString(),
    result_water:    resultWater.toString(),
    result_energy:   resultEnergy.toString(),
    insight_bottles: insight_bottles.toString(),
    insight_car:     insight_car.toString(),
    insight_people:  insight_people.toString(),
    insight_hours:   insight_hours.toString(),
    lead_date:       leadDate
    })
    .then(() => console.log('✅ Confirmation email sent'))
    .catch(err => console.error('❌ EmailJS error (confirmation):', err));

    // ─── EMAILJS: Send lead notification to site owner ─────────────
    emailjs.send('service_s6mj7hb', 'template_o1ml1he', {
    user_name:       name,
    user_email:      email,
    mass:            mass.toString(),
    result_plastic:  resultPlastic.toString(),
    result_co2:      resultCO2.toString(),
    result_water:    resultWater.toString(),
    result_energy:   resultEnergy.toString(),
    insight_bottles: insight_bottles.toString(),
    insight_car:     insight_car.toString(),
    insight_people:  insight_people.toString(),
    insight_hours:   insight_hours.toString(),
    lead_date:       leadDate
    })
    .then(() => console.log('✅ Lead notification sent'))
    .catch(err => console.error('❌ EmailJS error (lead):', err));
  });

  // ─── Metric‐Card Insights ───────────────────────────────────────
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      insightSec.classList.remove('hidden');

      const type = card.dataset.type;
      const map  = {
        plastic:'insightPlastic',
        co2:    'insightCO2',
        water:  'insightWater',
        energy: 'insightEnergy'
      };
      const box = document.getElementById(map[type]);
      const ind = card.querySelector('.metric-indicator');

      // hide all
      document.querySelectorAll('.insight-card').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.metric-indicator').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('show');
      });

      // build HTML
      const m  = parseFloat(massInput.value);
      const fn = factors;
      let html = '';

      if (type === 'plastic') {
        html = `
          <i class="fas fa-heart icon"></i>
          <div class="content">
            <div class="highlight">${formatNum(m)} kg plastic displaced</div>
            <div>That’s like removing <strong>${formatNum(m*200)}</strong> plastic bottles!</div>
            <div class="tagline">Less plastic waste. More circular economy.</div>
          </div>`;
      } else if (type === 'co2') {
        const v = m * fn.virgin.co2, p = m * fn.pcr.co2, d = v - p;
        html = `
          <i class="fas fa-heart icon"></i>
          <div class="content">
            <div class="highlight">${formatNum(d)} kg CO₂e avoided</div>
            <div>Virgin: ${formatNum(v)} kg<br>Recree8® PCR: ${formatNum(p)} kg</div>
            <div class="emoji">🌿 That’s like avoiding <strong>${Math.round(d*4)}</strong> km of car travel!</div>
            <div class="tagline">Lower emissions. Healthier planet.</div>
          </div>`;
      } else if (type === 'water') {
        const v = m * fn.virgin.water, p = m * fn.pcr.water, d = v - p;
        html = `
          <i class="fas fa-heart icon"></i>
          <div class="content">
            <div class="highlight">${formatNum(d)} L water saved</div>
            <div>Virgin: ${formatNum(v)} L<br>Recree8® PCR: ${formatNum(p)} L</div>
            <div class="emoji">💧 Enough for <strong>${Math.round(d/2)}</strong> people/day.</div>
            <div class="tagline">Conserve water. Sustain life.</div>
          </div>`;
      } else if (type === 'energy') {
        const v = m * fn.virgin.energy, p = m * fn.pcr.energy, d = v - p;
        html = `
          <i class="fas fa-heart icon"></i>
          <div class="content">
            <div class="highlight">${formatNum(d)} kWh saved</div>
            <div>Virgin: ${formatNum(v)} kWh<br>Recree8® PCR: ${formatNum(p)} kWh</div>
            <div class="emoji">⚡️ Powers an LED bulb for <strong>${Math.round(d*50)}</strong> hours!</div>
            <div class="tagline">Less energy use = less emissions. Be part of the smarter solution.</div>
          </div>`;
      }

      // inject & show
      box.innerHTML = html;
      box.classList.remove('hidden');
      ind.classList.remove('hidden');
      ind.classList.add('show');
    });
  });
});
