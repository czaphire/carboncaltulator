function calculateAndGenerateReport() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const weight = parseFloat(document.getElementById('plasticWeight').value);

  if (!name || !email || isNaN(weight) || weight <= 0) {
    alert("Please fill in all fields with valid information.");
    return;
  }

  const virginCO2 = weight * 1.9;
  const pcrCO2 = weight * 0.7;
  const savings = virginCO2 - pcrCO2;
  const carsOffRoad = savings / 4600;

 const resultHTML = `
  <h3>Hi ${name}, here are your results:</h3>

  <details>
    <summary><strong>Virgin Plastic Emissions</strong></summary>
    <p>${virginCO2.toFixed(2)} kg CO₂e</p>
  </details>

  <details>
    <summary><strong>PCR Plastic Emissions</strong></summary>
    <p>${pcrCO2.toFixed(2)} kg CO₂e</p>
  </details>

  <details>
    <summary><strong>Estimated Carbon Savings</strong></summary>
    <p>${savings.toFixed(2)} kg CO₂e</p>
  </details>

  <p>🌏 Equivalent to removing <strong>${carsOffRoad.toFixed(2)} cars</strong> off the road for one year.</p>
  <p>📩 A full report will be sent to: <strong>${email}</strong> (backend integration required).</p>
`;



  const output = document.getElementById('output');
  output.innerHTML = resultHTML;
  output.style.display = 'block';

  // Placeholder for backend integration
  console.log("User Report Data:", { name, email, weight, virginCO2, pcrCO2, savings, carsOffRoad });
}
