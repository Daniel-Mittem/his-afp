(function (window) {
  window['env'] = window['env'] || {};
  // Questo segnaposto verrà sostituito all'avvio del container
  // window['env']['<var_JS>'] = '${<var_DOCKER>}';
  window['env']['type'] = 'LOCAL';
  window['env']['version'] = 'x.y.z';
})(this);
