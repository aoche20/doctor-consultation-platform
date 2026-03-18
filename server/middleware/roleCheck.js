exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Le rôle ${req.user.role} n'a pas accès à cette ressource` 
      });
    }

    next();
  };
};

// Vérifier si c'est un médecin
exports.isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ 
      success: false, 
      message: 'Cette action est réservée aux médecins' 
    });
  }
  next();
};

// Vérifier si c'est un patient
exports.isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ 
      success: false, 
      message: 'Cette action est réservée aux patients' 
    });
  }
  next();
};