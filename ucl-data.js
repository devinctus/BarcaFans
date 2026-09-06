/* UCL 2026/27 league phase data. Browser global + Node module. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const UCL_TEAMS = {
    // Pot 1
    PSG: { code: 'PSG', name: 'Paris Saint-Germain', country: '🇫🇷', pot: 1, crest: 'crests/psg.svg' },
    BAY: { code: 'BAY', name: 'Bayern Munich',        country: '🇩🇪', pot: 1, crest: 'crests/bay.svg' },
    RMA: { code: 'RMA', name: 'Real Madrid',          country: '🇪🇸', pot: 1, crest: 'crests/rma.svg' },
    LIV: { code: 'LIV', name: 'Liverpool',            country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 1, crest: 'crests/liv.png' },
    INT: { code: 'INT', name: 'Inter Milan',          country: '🇮🇹', pot: 1, crest: 'crests/int.svg' },
    MCI: { code: 'MCI', name: 'Manchester City',      country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 1, crest: 'crests/mci.svg' },
    ARS: { code: 'ARS', name: 'Arsenal',              country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 1, crest: 'crests/ars.svg' },
    BAR: { code: 'BAR', name: 'Barcelona',            country: '🇪🇸', pot: 1, crest: 'crests/bar.svg' },
    ATM: { code: 'ATM', name: 'Atlético Madrid',      country: '🇪🇸', pot: 1, crest: 'crests/atm.svg' },

    // Pot 2
    BVB: { code: 'BVB', name: 'Borussia Dortmund',    country: '🇩🇪', pot: 2, crest: 'crests/bvb.svg' },
    ROM: { code: 'ROM', name: 'Roma',                 country: '🇮🇹', pot: 2, crest: 'crests/rom.svg' },
    SCP: { code: 'SCP', name: 'Sporting CP',          country: '🇵🇹', pot: 2, crest: 'crests/scp.svg' },
    AVL: { code: 'AVL', name: 'Aston Villa',          country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 2, crest: 'crests/avl.svg' },
    POR: { code: 'POR', name: 'Porto',                country: '🇵🇹', pot: 2, crest: 'crests/por.png' },
    MUN: { code: 'MUN', name: 'Manchester United',    country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pot: 2, crest: 'crests/mun.svg' },
    BRU: { code: 'BRU', name: 'Club Brugge',          country: '🇧🇪', pot: 2, crest: 'crests/bru.png' },
    BET: { code: 'BET', name: 'Real Betis',           country: '🇪🇸', pot: 2, crest: 'crests/bet.png' },
    PSV: { code: 'PSV', name: 'PSV Eindhoven',        country: '🇳🇱', pot: 2, crest: 'crests/psv.svg' },

    // Pot 3
    FEY: { code: 'FEY', name: 'Feyenoord',            country: '🇳🇱', pot: 3, crest: 'crests/fey.svg' },
    LIL: { code: 'LIL', name: 'Lille',                country: '🇫🇷', pot: 3, crest: 'crests/lil.svg' },
    BOD: { code: 'BOD', name: 'Bodø/Glimt',           country: '🇳🇴', pot: 3, crest: 'crests/bod.svg' },
    NAP: { code: 'NAP', name: 'Napoli',               country: '🇮🇹', pot: 3, crest: 'crests/nap.svg' },
    RBL: { code: 'RBL', name: 'RB Leipzig',           country: '🇩🇪', pot: 3, crest: 'crests/rbl.svg' },
    VIL: { code: 'VIL', name: 'Villarreal',           country: '🇪🇸', pot: 3, crest: 'crests/vil.svg' },
    FEN: { code: 'FEN', name: 'Fenerbahçe',           country: '🇹🇷', pot: 3, crest: 'crests/fen.svg' },
    SHK: { code: 'SHK', name: 'Shakhtar Donetsk',     country: '🇺🇦', pot: 3, crest: 'crests/shk.svg' },
    GAL: { code: 'GAL', name: 'Galatasaray',          country: '🇹🇷', pot: 3, crest: 'crests/gal.svg' },

    // Pot 4
    SLA: { code: 'SLA', name: 'Slavia Prague',        country: '🇨🇿', pot: 4, crest: 'crests/sla.svg' },
    SLB: { code: 'SLB', name: 'Slovan Bratislava',    country: '🇸🇰', pot: 4, crest: 'crests/slb.svg' },
    VFB: { code: 'VFB', name: 'VfB Stuttgart',        country: '🇩🇪', pot: 4, crest: 'crests/vfb.svg' },
    AEK: { code: 'AEK', name: 'AEK Athens',           country: '🇬🇷', pot: 4, crest: 'crests/aek.svg' },
    LSK: { code: 'LSK', name: 'LASK',                 country: '🇦🇹', pot: 4, crest: 'crests/lsk.svg' },
    COM: { code: 'COM', name: 'Como',                 country: '🇮🇹', pot: 4, crest: 'crests/com.svg' },
    LEN: { code: 'LEN', name: 'Lens',                 country: '🇫🇷', pot: 4, crest: 'crests/len.svg' },
    VIK: { code: 'VIK', name: 'Viking',               country: '🇳🇴', pot: 4, crest: 'crests/vik.svg' },
    SAB: { code: 'SAB', name: 'Sabah',                country: '🇦🇿', pot: 4, crest: 'crests/sab.png' },
  };

  return { UCL_TEAMS };
});
