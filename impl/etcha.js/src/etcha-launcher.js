function launch(prefix, container, config) {
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }
  config = config || {};
  var deps = [
    "yoob/element-factory.js",
    "yoob/controller.js",
    "yoob/playfield.js",
    "yoob/cursor.js",
    "yoob/playfield-canvas-view.js",
    "yoob/source-html-view.js",
    "yoob/preset-manager.js",
    "yoob/source-manager.js",
    "etcha.js"
  ];
  var loaded = 0;
  var onload = function() {
    if (++loaded < deps.length) return;

    var etchaController;
    var controlPanel = yoob.makeDiv(container);
    controlPanel.id = 'control_panel';

    var subPanel = yoob.makeDiv(container);
    var subSubPanel = yoob.makeDiv(subPanel);
    var repeatIndefinitely = yoob.makeCheckbox(subSubPanel, false, "repeat indefinitely", function(checked) {
      etchaController.setRepeatIndefinitely(checked);
    });
    var selectSource = yoob.makeSelect(subPanel, 'configuration:', []);

    var display = yoob.makeDiv(container);
    var programDisplay = yoob.makePre(display);
    programDisplay.id = 'program_display';
    var canvas = yoob.makeCanvas(display, 400, 400);
    canvas.id = 'playfield_canvas';
    var editor = yoob.makeTextArea(container, 40, 25);

    var pfView = makeEtchaPlayfieldView({
        canvas: canvas
    });
    pfView.setCellDimensions(12, 12);

    var progView = new yoob.SourceHTMLView();
    progView.init('', programDisplay);

    etchaController = (new EtchaController()).init({
        panelContainer: controlPanel,
        view: progView,
        pfView: pfView
    });

    var sourceManager = (new yoob.SourceManager()).init({
        panelContainer: controlPanel,
        editor: editor,
        hideDuringEdit: [display],
        disableDuringEdit: [etchaController.panel],
        storageKey: 'etcha.js',
        onDone: function() {
            etchaController.performReset(this.getEditorText());
        }
    });

    var presetManager = (new yoob.PresetManager()).init({
      selectElem: selectSource
    });
    function makeCallback(sourceText) {
      return function(id) {
        sourceManager.loadSource(sourceText);
      }
    }
    for (var i = 0; i < examplePrograms.length; i++) {
      presetManager.add(examplePrograms[i][0], makeCallback(examplePrograms[i][1]));
    }
    presetManager.select(examplePrograms[0][0]);
  };
  for (var i = 0; i < deps.length; i++) {
    var elem = document.createElement('script');
    elem.src = prefix + deps[i];
    elem.onload = onload;
    document.body.appendChild(elem);
  }
}
