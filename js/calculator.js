/**
 * ==========================================================================
 * VAIBHAV TRADERS - CONSTRUCTION MATERIAL ESTIMATOR
 * Standard civil formulas tailored for Maharashtra units (Brass, Bags, Tons)
 * ==========================================================================
 */

const VTCalculator = {
  currentTab: 'concrete',

  init() {
    this.bindTabs();
    this.bindCalculators();
    this.calculateConcrete();
    this.calculateBricks();
    this.calculatePlaster();
  },

  bindTabs() {
    const tabs = document.querySelectorAll('.calc-tab-btn');
    const sections = {
      concrete: document.getElementById('calcSectionConcrete'),
      bricks: document.getElementById('calcSectionBricks'),
      plaster: document.getElementById('calcSectionPlaster')
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-target');
        this.currentTab = target;

        Object.keys(sections).forEach(key => {
          if (sections[key]) {
            sections[key].style.display = (key === target) ? 'grid' : 'none';
          }
        });
      });
    });
  },

  bindCalculators() {
    // Concrete inputs
    ['concLength', 'concWidth', 'concThick', 'concGrade'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.calculateConcrete());
    });

    // Brickwork inputs
    ['brickLength', 'brickHeight', 'brickThickness'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.calculateBricks());
    });

    // Plaster inputs
    ['plasterArea', 'plasterType'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.calculatePlaster());
    });

    // Send calculation to WhatsApp
    const sendCalcBtns = document.querySelectorAll('.btn-send-calc');
    sendCalcBtns.forEach(btn => {
      btn.addEventListener('click', () => this.sendCalculationToWhatsApp());
    });
  },

  // 1. Concrete Calculator (IS 456 M20 / M25)
  calculateConcrete() {
    const length = parseFloat(document.getElementById('concLength')?.value) || 0;
    const width = parseFloat(document.getElementById('concWidth')?.value) || 0;
    const thickInches = parseFloat(document.getElementById('concThick')?.value) || 0;
    const grade = document.getElementById('concGrade')?.value || 'M20';

    const thickFt = thickInches / 12;
    const volCuFt = length * width * thickFt;
    const volCuM = volCuFt * 0.0283168; // 1 cu ft = 0.0283168 cu m

    // Dry volume multiplier = 1.54
    const dryVolume = volCuM * 1.54;

    let cementBags = 0;
    let sandBrass = 0;
    let aggregateBrass = 0;
    let steelKg = 0;

    if (volCuM > 0) {
      if (grade === 'M20') {
        // Ratio 1 : 1.5 : 3 (Total = 5.5)
        const cementCuM = (1 / 5.5) * dryVolume;
        cementBags = Math.ceil(cementCuM / 0.035); // 1 bag 50kg = 0.035 cu m
        const sandCuM = (1.5 / 5.5) * dryVolume;
        sandBrass = (sandCuM * 35.3147 / 100).toFixed(2); // 1 Brass = 100 cu ft
        const aggCuM = (3 / 5.5) * dryVolume;
        aggregateBrass = (aggCuM * 35.3147 / 100).toFixed(2);
      } else {
        // M25: Ratio 1 : 1 : 2 (Total = 4)
        const cementCuM = (1 / 4) * dryVolume;
        cementBags = Math.ceil(cementCuM / 0.035);
        const sandCuM = (1 / 4) * dryVolume;
        sandBrass = (sandCuM * 35.3147 / 100).toFixed(2);
        const aggCuM = (2 / 4) * dryVolume;
        aggregateBrass = (aggCuM * 35.3147 / 100).toFixed(2);
      }
      // Steel approx 80kg per cu.m of RCC slab/beam
      steelKg = Math.round(volCuM * 80);
    }

    this.setElemText('outConcVol', `${volCuFt.toFixed(1)} Cu.Ft (${volCuM.toFixed(2)} m³)`);
    this.setElemText('outConcCement', `${cementBags} Bags (50kg)`);
    this.setElemText('outConcSand', `${sandBrass} Brass (${(sandBrass * 4.5).toFixed(1)} Tons approx)`);
    this.setElemText('outConcAgg', `${aggregateBrass} Brass (${(aggregateBrass * 4.8).toFixed(1)} Tons approx)`);
    this.setElemText('outConcSteel', `${steelKg} Kg (${(steelKg / 1000).toFixed(2)} Tons)`);

    this.lastConcreteResult = { volCuFt, volCuM, cementBags, sandBrass, aggregateBrass, steelKg, grade };
  },

  // 2. Brickwork Calculator
  calculateBricks() {
    const length = parseFloat(document.getElementById('brickLength')?.value) || 0;
    const height = parseFloat(document.getElementById('brickHeight')?.value) || 0;
    const thickness = document.getElementById('brickThickness')?.value || '9'; // 9 inch or 4.5 inch

    const wallAreaSqFt = length * height;
    let brickCount = 0;
    let cementBags = 0;
    let sandBrass = 0;

    if (wallAreaSqFt > 0) {
      if (thickness === '9') {
        // 9" wall: ~9 to 9.5 bricks per sq ft + 5% wastage
        brickCount = Math.ceil(wallAreaSqFt * 9.2 * 1.05);
        cementBags = Math.ceil(wallAreaSqFt * 0.045);
        sandBrass = (wallAreaSqFt * 0.0035).toFixed(2);
      } else {
        // 4.5" partition wall: ~4.5 bricks per sq ft + 5% wastage
        brickCount = Math.ceil(wallAreaSqFt * 4.6 * 1.05);
        cementBags = Math.ceil(wallAreaSqFt * 0.022);
        sandBrass = (wallAreaSqFt * 0.0018).toFixed(2);
      }
    }

    this.setElemText('outBrickArea', `${wallAreaSqFt.toFixed(0)} Sq.Ft`);
    this.setElemText('outBrickCount', `${brickCount} Bricks (incl. 5% margin)`);
    this.setElemText('outBrickCement', `${cementBags} Bags (50kg)`);
    this.setElemText('outBrickSand', `${sandBrass} Brass`);

    this.lastBrickResult = { wallAreaSqFt, brickCount, cementBags, sandBrass, thickness };
  },

  // 3. Plastering Calculator
  calculatePlaster() {
    const area = parseFloat(document.getElementById('plasterArea')?.value) || 0;
    const type = document.getElementById('plasterType')?.value || 'internal'; // internal 12mm 1:6 or external 20mm 1:4

    let cementBags = 0;
    let sandBrass = 0;

    if (area > 0) {
      if (type === 'internal') {
        // 12mm 1:6 mix: 1 bag covers approx 110-120 sq ft
        cementBags = Math.ceil(area / 115);
        sandBrass = (area * 0.0014).toFixed(2);
      } else {
        // 20mm 1:4 double coat external: 1 bag covers approx 55-60 sq ft
        cementBags = Math.ceil(area / 60);
        sandBrass = (area * 0.0022).toFixed(2);
      }
    }

    this.setElemText('outPlasterArea', `${area.toFixed(0)} Sq.Ft`);
    this.setElemText('outPlasterCement', `${cementBags} Bags (50kg)`);
    this.setElemText('outPlasterSand', `${sandBrass} Brass Plaster Sand`);

    this.lastPlasterResult = { area, type, cementBags, sandBrass };
  },

  setElemText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  // Send calculated material requirement to WhatsApp & save lead
  sendCalculationToWhatsApp() {
    let summary = '';
    const settings = window.VTStore.getSettings();

    if (this.currentTab === 'concrete' && this.lastConcreteResult) {
      const r = this.lastConcreteResult;
      summary = `*Vaibhav Traders - Concrete Slab Estimation*\n` +
        `• Grade: ${r.grade}\n` +
        `• Volume: ${r.volCuFt.toFixed(1)} Cu.Ft\n` +
        `• Cement Needed: ${r.cementBags} Bags\n` +
        `• Sand Needed: ${r.sandBrass} Brass\n` +
        `• Aggregate 20mm: ${r.aggregateBrass} Brass\n` +
        `• Steel Rebar: ${r.steelKg} Kg`;
    } else if (this.currentTab === 'bricks' && this.lastBrickResult) {
      const r = this.lastBrickResult;
      summary = `*Vaibhav Traders - Brickwork Estimation*\n` +
        `• Wall Thickness: ${r.thickness} Inches\n` +
        `• Wall Area: ${r.wallAreaSqFt} Sq.Ft\n` +
        `• Bricks Needed: ${r.brickCount} Bricks\n` +
        `• Cement Bags: ${r.cementBags} Bags\n` +
        `• Mortar Sand: ${r.sandBrass} Brass`;
    } else if (this.currentTab === 'plaster' && this.lastPlasterResult) {
      const r = this.lastPlasterResult;
      summary = `*Vaibhav Traders - Plaster Estimation*\n` +
        `• Plaster Type: ${r.type.toUpperCase()}\n` +
        `• Area: ${r.area} Sq.Ft\n` +
        `• Cement Bags: ${r.cementBags} Bags\n` +
        `• Plaster Sand: ${r.sandBrass} Brass`;
    }

    const message = encodeURIComponent(
      `Hello Vaibhav Traders,\nI calculated my material requirements using your website estimator:\n\n` +
      `${summary}\n\n` +
      `Please provide your best wholesale supply rate with site delivery at Thangaon / Sinnar.`
    );

    // Save as lead
    window.VTStore.addLead({
      name: 'Calculator User',
      phone: 'WhatsApp Inquirer',
      material: `${this.currentTab.toUpperCase()} Estimate`,
      quantity: summary.replace(/\*/g, '').slice(0, 100),
      location: 'Thangaon / Sinnar Area',
      type: 'Calculator Estimate',
      notes: 'Generated directly from interactive construction calculator.'
    });

    VTApp.showToast('Opening WhatsApp with your calculated material list...', 'success');

    setTimeout(() => {
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
    }, 500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VTCalculator.init();
});
