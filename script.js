let currentMode = 'rh';

// Formler for metningsdamptrykk og invers Magnus
const getEs = (T) => 6.112 * Math.exp((17.62 * T) / (243.12 + T));

const getTFromE = (e) => {
  const b = 17.62;
  const c = 243.12;
  const ln = Math.log(e / 6.112);
  return (c * ln) / (b - ln);
};

// Funksjon for å bytte modus (Fuktighet eller Temperatur)
function setMode(mode) {
  currentMode = mode;
  document.getElementById('tab_rh').classList.toggle('active', mode === 'rh');
  document.getElementById('tab_temp').classList.toggle('active', mode === 'temp');
  document.getElementById('input_rh_mode').classList.toggle('hidden', mode !== 'rh');
  document.getElementById('input_temp_mode').classList.toggle('hidden', mode !== 'temp');
  update();
}

// Hovedfunksjon for beregning
function update(e) {
  // Synkroniser sliders og tallfelt
  if (e) {
    const id = e.target.id;
    if (id.includes('range')) {
      document.getElementById(id.replace('range', 'num')).value = e.target.value;
    } else if (id.includes('num')) {
      document.getElementById(id.replace('num', 'range')).value = e.target.value;
    }
  }

  const t1 = parseFloat(document.getElementById('t1_num').value);
  const rh1 = parseFloat(document.getElementById('rh1_num').value);
  
  // Beregn faktisk damptrykk ved start (konstant verdi)
  const es1 = getEs(t1);
  const e_faktisk = (rh1 / 100) * es1;
  const dp = getTFromE(e_faktisk);

  // Oppdater debug-info
  document.getElementById('debug_dp').innerText = `Duggpunkt: ${dp.toFixed(1)}°C`;
  document.getElementById('debug_e').innerText = `P: ${e_faktisk.toFixed(2)} hPa`;

  const resValEl = document.getElementById('res_val');
  const resLabelEl = document.getElementById('res_label');

  if (currentMode === 'rh') {
    const t2 = parseFloat(document.getElementById('t2_num').value);
    const es2 = getEs(t2);
    let rh2 = (e_faktisk / es2) * 100;
    
    resLabelEl.innerText = "Ny relativ fuktighet";
    resValEl.className = rh2 > 100 ? "value res-warning" : "value res-num";
    resValEl.innerText = rh2 > 100 ? "100% (Kondens)" : rh2.toFixed(1) + " %";
  } else {
    const rh2_target = parseFloat(document.getElementById('rh2_num').value);
    const es2_target = e_faktisk / (rh2_target / 100);
    const t2_target = getTFromE(es2_target);
    
    resLabelEl.innerText = "Nødvendig temperatur";
    resValEl.className = "value res-num";
    resValEl.innerText = isNaN(t2_target) ? "--" : t2_target.toFixed(1) + " °C";
  }
}

// Lytt etter endringer på alle input-felter
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', update);
});

// Kjør første beregning ved oppstart
update();