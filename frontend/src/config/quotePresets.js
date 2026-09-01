export const QUOTE_PRESETS = {
  islam: {
    text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.',
    source: 'QS. Ar-Rum: 21',
  },
  kristen: {
    text: 'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.',
    source: 'Kejadian 2:24',
  },
  katolik: {
    text: 'Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.',
    source: 'Matius 19:6',
  },
  hindu: {
    text: 'Om iha imav indra sam nudha cakravakeva dampati. prajayau gunavanau visvam ayur vyasnutam.',
    source: 'Rgveda X.85.42',
  },
  budha: {
    text: 'Cinta sejati selalu memancarkan kebahagiaan. Jika cintamu belum memancarkan kebahagiaan, itu belum disebut cinta sejati.',
    source: 'Thich Nhat Hanh',
  },
};

export function resolveInvitationQuote(settings = {}) {
  const preset = QUOTE_PRESETS[settings.religion] || QUOTE_PRESETS.islam;
  return {
    text: settings.customText || settings.text || preset.text,
    source: settings.customSource || settings.source || preset.source,
  };
}
