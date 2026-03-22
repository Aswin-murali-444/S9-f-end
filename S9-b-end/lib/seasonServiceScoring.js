/**
 * Seasonal / weather-style multipliers for services (India-centric defaults).
 * Keep in sync with S9-ml-service/app.py: _india_season_phase, _season_multiplier_for_text,
 * and the post_monsoon branch in _build_season_multipliers.
 */

function indiaSeasonPhase(month) {
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 3 && month <= 5) return 'summer';
  if (month === 11 || month === 12 || month === 1 || month === 2) return 'winter';
  return 'neutral';
}

/**
 * @param {string} hay - lowercased name + description
 * @param {string} phase - monsoon | summer | winter | neutral | post_monsoon
 * @param {string} country - uppercased ISO country code
 * @returns {{ multiplier: number, reasonKey: string|null }}
 */
function seasonMultiplierForText(hay, phase, country) {
  const h = hay || '';
  if (country !== 'IN') {
    return { multiplier: 1.0, reasonKey: null };
  }

  if (phase === 'monsoon') {
    const strongAvoid = [
      'exterior paint',
      'outdoor paint',
      'external paint',
      'facade',
      'outer wall',
      'terrace paint',
      'roof paint'
    ];
    for (const kw of strongAvoid) {
      if (h.includes(kw)) {
        return { multiplier: 0.06, reasonKey: 'season_avoid_outdoor_work' };
      }
    }
    const boost = [
      'waterproof',
      'water proof',
      'seepage',
      'damp',
      'dampness',
      'leak',
      'leakage',
      'drain',
      'drainage',
      'gutter',
      'flooding',
      'basement water'
    ];
    for (const kw of boost) {
      if (h.includes(kw)) {
        return { multiplier: 1.28, reasonKey: 'season_boost_monsoon_relevant' };
      }
    }
    const paintish = [
      'painter',
      'painting',
      'whitewash',
      'putty',
      'wallpaper install'
    ];
    for (const kw of paintish) {
      if (h.includes(kw)) {
        return { multiplier: 0.22, reasonKey: 'season_down_paint_monsoon' };
      }
    }
  }

  if (phase === 'summer') {
    const boost = [
      'ac service',
      'air condition',
      'air conditioner',
      'cooler',
      'refrigerator',
      'fridge',
      'cooling'
    ];
    for (const kw of boost) {
      if (h.includes(kw)) {
        return { multiplier: 1.22, reasonKey: 'season_boost_summer_cooling' };
      }
    }
    if (h.includes('exterior paint') || h.includes('outdoor paint')) {
      return { multiplier: 0.75, reasonKey: 'season_soft_down_exterior_summer' };
    }
  }

  if (phase === 'winter') {
    const boost = [
      'geyser',
      'water heater',
      'heater',
      'immersion',
      'solar water',
      'hot water'
    ];
    for (const kw of boost) {
      if (h.includes(kw)) {
        return { multiplier: 1.2, reasonKey: 'season_boost_winter_comfort' };
      }
    }
  }

  return { multiplier: 1.0, reasonKey: null };
}

/**
 * Full rules including October post-monsoon exterior cap (matches ML).
 * @param {string} name
 * @param {string} [description]
 * @param {number} month - 1-12
 * @param {string} [country] - default IN
 */
function computeSeasonScoreForService(name, description, month, country = 'IN') {
  const cc = String(country || 'IN').toUpperCase();
  const m = Math.max(1, Math.min(12, parseInt(String(month), 10) || 1));
  const bits = [name, description].filter(Boolean).map((x) => String(x).toLowerCase());
  const hay = bits.join(' ').slice(0, 2000);

  let phase = indiaSeasonPhase(m);
  if (phase === 'neutral' && cc === 'IN' && m === 10) {
    phase = 'post_monsoon';
  }

  let { multiplier: mult, reasonKey: reason } = seasonMultiplierForText(hay, phase, cc);

  if (phase === 'post_monsoon' && cc === 'IN') {
    const kws = ['exterior paint', 'outdoor paint', 'facade'];
    if (kws.some((k) => hay.includes(k))) {
      mult = Math.min(mult, 0.45);
      if (mult <= 0.45) {
        reason = reason || 'season_soft_post_monsoon_exterior';
      }
    }
  }

  return { multiplier: mult, reasonKey: reason };
}

/** Simple hash for change detection (not cryptographic). */
function fingerprintServiceText(name, description) {
  const s = `${name || ''}\n${description || ''}`;
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

module.exports = {
  indiaSeasonPhase,
  seasonMultiplierForText,
  computeSeasonScoreForService,
  fingerprintServiceText
};
