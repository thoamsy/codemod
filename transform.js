const swapAt = (obj, indexA, indexB) =>
  ([obj[indexA], obj[indexB]] = [obj[indexB], obj[indexA]]);
export default (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.CallExpression).forEach(e => {
    if (e.value.callee.name !== 'safeGet') {
      return;
    }
    if (e.value.arguments.length >= 2) {
      swapAt(e.value.arguments, 0, 1);
    }
  });
  return root.toSource();
};
