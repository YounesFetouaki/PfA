/**
 * Middleware d'authentification
 * À adapter selon votre système d'authentification (JWT, OAuth, etc.)
 */

const authenticate = (req, res, next) => {
  // TODO: Implémenter l'authentification réelle
  // Exemple avec JWT:
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) {
  //   return res.status(401).json({ error: 'Non authentifié' });
  // }
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = decoded;
  //   next();
  // } catch (error) {
  //   return res.status(401).json({ error: 'Token invalide' });
  // }

  // Pour l'instant, simulation d'un utilisateur
  const userId = req.headers['user-id'] || req.headers['authorization']?.split(' ')[1] || 'default-user';
  const organizationId = req.headers['organization-id'] || 'default-org';

  req.user = {
    id: userId,
    organizationId: organizationId
  };

  next();
};

module.exports = { authenticate };

