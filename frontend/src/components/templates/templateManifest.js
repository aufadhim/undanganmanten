export const REQUIRED_TEMPLATE_FEATURES = [
  'cover',
  'quote',
  'profile',
  'events',
  'countdown',
  'gallery',
  'video',
  'story',
  'dresscode',
  'rundown',
  'livestream',
  'rsvp',
  'gift',
  'wishes',
  'footer',
  'music',
];

export const TEMPLATE_MANIFEST = [
  template('eternal', 'Eternal', 'eternal-wrapper'),
  template('seraya', 'Seraya', 'seraya'),
  template('nawasena', 'Nawasena', 'nawasena'),
  template('isvara', 'Isvara', 'isvara'),
  template('lanqing', 'Lanqing', 'lanqing'),
  template('celluloid', 'Celluloid', 'atelier-celluloid'),
  template('nocturne', 'Nocturne', 'nocturne'),
];

function template(id, name, rootClass) {
  return {
    id,
    name,
    rootClass,
    component: `${id}/${name}Template.jsx`,
    stylesheet: `${id}/${id}.css`,
    features: [...REQUIRED_TEMPLATE_FEATURES],
  };
}
