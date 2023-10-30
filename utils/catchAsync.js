//Wrap our async functions to easily catch express errors.
//Just helpful to reduce redundant code
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
