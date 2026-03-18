export const slugify = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const deslugify = (slug: string): string => {
  // Gérer les différents formats
  const words = slug.split('-');
  
  // Traiter chaque mot
  const formattedWords = words.map(word => {
    // Cas spéciaux
    if (word === 'dr') return 'Dr';
    if (word === 'pr') return 'Pr';
    if (word === 'me') return 'Me';
    
    // Capitaliser la première lettre
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  // Joindre avec des espaces
  let name = formattedWords.join(' ');
  
  // Ajouter un point après Dr si nécessaire (selon votre base de données)
  // Décommentez si vos noms sont stockés avec "Dr."
  // if (name.startsWith('Dr ')) {
  //   name = name.replace('Dr ', 'Dr. ');
  // }
  
  console.log('🔍 deslugify:', { slug, name });
  return name;
};